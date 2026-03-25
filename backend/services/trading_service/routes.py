from fastapi import APIRouter, HTTPException, Request, Query
from datetime import datetime
from typing import Optional
import asyncio
import logging
import re

from models import AnalysisRequest, AnalysisBatchRequest, AnalysisState
from .service import TradingService
from services.socket_service import manager as user_manager
from config.database import get_pool

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/trading", tags=["trading"])

trading_service: Optional[TradingService] = None

# Per-user running tasks: user_id -> asyncio.Task
user_analysis_tasks: dict[str, asyncio.Task] = {}


def set_trading_service(service: TradingService):
    global trading_service
    trading_service = service


def set_broadcast_callbacks(broadcast_status_fn, broadcast_log_fn):
    """Legacy shim — no longer used but kept for backward-compat with main.py."""
    pass


# ── Progress estimation ────────────────────────────────────────────────────────

_PROGRESS_MAP: list[tuple[str, int]] = [
    ("MOCK MODE: Analyzing", 5),
    ("REAL MODE: Analyzing", 5),
    ("Configuration built", 10),
    ("Creating trading graph", 12),
    ("Phase 1:", 12),
    ("Analyst Reports", 12),
    ("Running Market Analyst", 14),
    ("Market Analyst completed", 18),
    ("Running Social", 20),
    ("Social Analyst completed", 24),
    ("Running News Analyst", 26),
    ("News Analyst completed", 30),
    ("Running Fundamentals", 32),
    ("Fundamentals Analyst completed", 37),
    ("Running Momentum", 39),
    ("Momentum Analyst completed", 44),
    ("Phase 2:", 46),
    ("Research Analysis", 46),
    ("Bull Researcher", 50),
    ("Bear Researcher", 55),
    ("Research Manager", 60),
    ("Phase 3:", 64),
    ("Trading Decision", 64),
    ("Trader completed", 70),
    ("Phase 4:", 74),
    ("Risk Assessment", 74),
    ("Conservative", 78),
    ("Neutral", 82),
    ("Aggressive", 86),
    ("Generating final", 90),
    ("FINAL TRADING DECISION", 94),
    ("Analysis completed successfully", 100),
]


def _estimate_progress(message: str) -> Optional[int]:
    msg_lower = message.lower()
    for keyword, pct in _PROGRESS_MAP:
        if keyword.lower() in msg_lower:
            return pct
    return None


def _extract_decision(messages: list[str]) -> Optional[str]:
    """Try to pull BUY / SELL / HOLD out of accumulated log messages."""
    for msg in reversed(messages):
        m = re.search(r"(?:Signal|Action):\s*(BUY|SELL|HOLD)", msg, re.IGNORECASE)
        if m:
            return m.group(1).upper()
        m = re.search(r"final.trade.decision[:\s]+(BUY|SELL|HOLD)", msg, re.IGNORECASE)
        if m:
            return m.group(1).upper()
    return None


# ── DB helpers ─────────────────────────────────────────────────────────────────


async def _save_result_to_db(user_id: str, ticker: str, result_text: str, decision: Optional[str]) -> None:
    try:
        pool = get_pool()
        async with pool.acquire() as conn:
            # Resolve company
            company_id = await conn.fetchval("SELECT id FROM companies WHERE UPPER(ticker) = $1", ticker.upper())
            if not company_id:
                company_id = await conn.fetchval(
                    """
                    INSERT INTO companies (name, ticker) VALUES ($1, $2)
                    ON CONFLICT (UPPER(ticker)) DO UPDATE SET ticker = EXCLUDED.ticker
                    RETURNING id
                    """,
                    ticker.upper(),
                    ticker.upper(),
                )

            # Resolve user_companies (upsert-style)
            uc_id = await conn.fetchval(
                "SELECT id FROM user_companies WHERE user_id = $1 AND company_id = $2",
                user_id,
                company_id,
            )
            if not uc_id:
                uc_id = await conn.fetchval(
                    """
                    INSERT INTO user_companies (user_id, company_id) VALUES ($1, $2)
                    ON CONFLICT (user_id, company_id) DO NOTHING RETURNING id
                    """,
                    user_id,
                    company_id,
                )
            if not uc_id:
                uc_id = await conn.fetchval(
                    "SELECT id FROM user_companies WHERE user_id = $1 AND company_id = $2",
                    user_id,
                    company_id,
                )

            # Save history
            save_text = decision or (result_text[-1000:] if result_text else "Analysis completed")
            await conn.execute(
                "INSERT INTO scan_history (user_company_id, result) VALUES ($1, $2)",
                uc_id,
                save_text,
            )
            logger.info(f"Saved analysis result for user {user_id}, ticker {ticker}")
    except Exception as exc:
        logger.error(f"Failed to save analysis result for {ticker}: {exc}", exc_info=True)


# ── Per-ticker runner ──────────────────────────────────────────────────────────


async def _run_single_ticker(user_id: str, request: AnalysisRequest) -> None:
    ticker = request.ticker
    accumulated: list[str] = []

    try:
        await user_manager.broadcast_user_progress(user_id, ticker, 0, "Starting")

        async for message in trading_service.run_analysis(request):
            accumulated.append(message)
            await user_manager.broadcast_user_log(user_id, ticker, message)
            pct = _estimate_progress(message)
            if pct is not None:
                step_label = message.strip()[:60]
                await user_manager.broadcast_user_progress(user_id, ticker, pct, step_label)

        # Final progress = 100
        await user_manager.broadcast_user_progress(user_id, ticker, 100, "Complete")

        # Extract & broadcast the decision
        decision = _extract_decision(accumulated)
        if decision:
            await user_manager.broadcast_user_result(user_id, ticker, decision)

        # Persist to DB
        await _save_result_to_db(user_id, ticker, "\n".join(accumulated), decision)

    except asyncio.CancelledError:
        await user_manager.broadcast_user_progress(user_id, ticker, -1, "Cancelled")
        raise
    except Exception as exc:
        err_msg = f"Analysis failed for {ticker}: {exc}"
        logger.error(err_msg, exc_info=True)
        await user_manager.broadcast_user_log(user_id, ticker, err_msg)
        await user_manager.broadcast_user_progress(user_id, ticker, -1, "Error")


# ── Batch runner ───────────────────────────────────────────────────────────────


async def _run_batch_analysis(user_id: str, request: AnalysisBatchRequest) -> None:
    global user_analysis_tasks
    try:
        await user_manager.broadcast_user_status(user_id, AnalysisState.RUNNING)
        await user_manager.broadcast_user_log(user_id, "", f"Starting analysis for: {', '.join(request.tickers)}")

        single_requests = request.to_single_requests()
        await asyncio.gather(
            *[_run_single_ticker(user_id, r) for r in single_requests],
            return_exceptions=True,
        )

        await user_manager.broadcast_user_status(user_id, AnalysisState.IDLE)

    except asyncio.CancelledError:
        await user_manager.broadcast_user_log(user_id, "", "Analysis batch stopped by user")
        await user_manager.broadcast_user_status(user_id, AnalysisState.STOPPED)
        raise
    except Exception as exc:
        logger.error(f"Batch analysis error for user {user_id}: {exc}", exc_info=True)
        await user_manager.broadcast_user_log(user_id, "", f"Analysis error: {exc}")
        await user_manager.broadcast_user_status(user_id, AnalysisState.ERROR)
    finally:
        user_analysis_tasks.pop(user_id, None)


# ── Routes ─────────────────────────────────────────────────────────────────────


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "trading",
        "trading_mode": "real" if trading_service and trading_service.is_real_mode else "mock",
    }


@router.get("/tickers/search")
async def search_tickers(q: str = Query(default="", max_length=50)):
    """Search for company tickers from the database."""
    try:
        pool = get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT name, ticker FROM companies
                WHERE UPPER(ticker) LIKE $1 OR LOWER(name) LIKE $2
                ORDER BY ticker
                LIMIT 15
                """,
                f"{q.upper()}%",
                f"%{q.lower()}%",
            )
        return [{"name": row["name"], "symbol": row["ticker"]} for row in rows]
    except Exception as exc:
        logger.error(f"Ticker search error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to search tickers")


@router.get("/status")
async def get_analysis_status(request: Request):
    """Return the current analysis state and ticker progress for the authenticated user."""
    user_id: str = request.state.user.get("sub")
    task = user_analysis_tasks.get(user_id)
    is_running = task is not None and not task.done()
    return {
        "state": user_manager.get_user_state(user_id).value,
        "is_running": is_running,
        "tickers": list(user_manager.get_user_ticker_progress(user_id).values()),
    }


@router.get("/config")
async def get_config():
    """Get available configuration options for the frontend."""
    return {
        "analysts": ["Market Analyst", "Social Media Analyst", "News Analyst", "Fundamentals Analyst", "Momentum Analyst"],
        "depth": [
            {"name": "Shallow - Quick research, few debate and strategy discussion rounds", "value": 1},
            {"name": "Medium - Middle ground, moderate debate rounds and strategy discussion", "value": 3},
            {"name": "Deep - Comprehensive research, in depth debate and strategy discussion", "value": 5},
        ],
        "provider": [
            {"name": "OpenAI", "value": "openai"},
            {"name": "Anthropic", "value": "anthropic"},
            {"name": "Google", "value": "google"},
            {"name": "Openrouter", "value": "openrouter"},
            {"name": "Ollama", "value": "ollama"},
        ],
        "shallow": {
            "openai": [
                {"name": "GPT-4o-mini - Fast and efficient for quick tasks", "value": "gpt-4o-mini"},
                {"name": "GPT-4.1-nano - Ultra-lightweight model for basic operations", "value": "gpt-4.1-nano"},
                {"name": "GPT-4.1-mini - Compact model with good performance", "value": "gpt-4.1-mini"},
                {"name": "GPT-4o - Standard model with solid capabilities", "value": "gpt-4o"},
            ],
            "anthropic": [
                {"name": "Claude Haiku 3.5 - Fast inference and standard capabilities", "value": "claude-3-5-haiku-latest"},
                {"name": "Claude Sonnet 3.5 - Highly capable standard model", "value": "claude-3-5-sonnet-latest"},
                {"name": "Claude Sonnet 3.7 - Exceptional hybrid reasoning and agentic capabilities", "value": "claude-3-7-sonnet-latest"},
                {"name": "Claude Sonnet 4 - High performance and excellent reasoning", "value": "claude-sonnet-4-0"},
            ],
            "google": [
                {"name": "Gemini 2.0 Flash-Lite - Cost efficiency and low latency", "value": "gemini-2.0-flash-lite"},
                {"name": "Gemini 2.0 Flash - Next generation features, speed, and thinking", "value": "gemini-2.0-flash"},
                {"name": "Gemini 2.5 Flash - Adaptive thinking, cost efficiency", "value": "gemini-2.5-flash-preview-05-20"},
            ],
            "openrouter": [
                {"name": "Meta: Llama 4 Scout", "value": "meta-llama/llama-4-scout:free"},
                {"name": "Meta: Llama 3.3 8B Instruct", "value": "meta-llama/llama-3.3-8b-instruct:free"},
                {"name": "Gemini 2.0 Flash Exp", "value": "google/gemini-2.0-flash-exp:free"},
            ],
            "ollama": [
                {"name": "llama3.1 local", "value": "llama3.1"},
                {"name": "llama3.2 local", "value": "llama3.2"},
            ],
        },
        "deep": {
            "openai": [
                {"name": "GPT-4.1-nano - Ultra-lightweight model for basic operations", "value": "gpt-4.1-nano"},
                {"name": "GPT-4.1-mini - Compact model with good performance", "value": "gpt-4.1-mini"},
                {"name": "GPT-4o - Standard model with solid capabilities", "value": "gpt-4o"},
                {"name": "o4-mini - Specialized reasoning model (compact)", "value": "o4-mini"},
                {"name": "o3-mini - Advanced reasoning model (lightweight)", "value": "o3-mini"},
                {"name": "o3 - Full advanced reasoning model", "value": "o3"},
                {"name": "o1 - Premier reasoning and problem-solving model", "value": "o1"},
            ],
            "anthropic": [
                {"name": "Claude Haiku 3.5 - Fast inference and standard capabilities", "value": "claude-3-5-haiku-latest"},
                {"name": "Claude Sonnet 3.5 - Highly capable standard model", "value": "claude-3-5-sonnet-latest"},
                {"name": "Claude Sonnet 3.7 - Exceptional hybrid reasoning and agentic capabilities", "value": "claude-3-7-sonnet-latest"},
                {"name": "Claude Sonnet 4 - High performance and excellent reasoning", "value": "claude-sonnet-4-0"},
                {"name": "Claude Opus 4 - Most powerful Anthropic model", "value": "claude-opus-4-0"},
            ],
            "google": [
                {"name": "Gemini 2.0 Flash-Lite - Cost efficiency and low latency", "value": "gemini-2.0-flash-lite"},
                {"name": "Gemini 2.0 Flash - Next generation features, speed, and thinking", "value": "gemini-2.0-flash"},
                {"name": "Gemini 2.5 Flash - Adaptive thinking, cost efficiency", "value": "gemini-2.5-flash-preview-05-20"},
                {"name": "Gemini 2.5 Pro", "value": "gemini-2.5-pro-preview-06-05"},
            ],
            "openrouter": [
                {"name": "DeepSeek V3", "value": "deepseek/deepseek-chat-v3-0324:free"},
                {"name": "Deepseek chat latest", "value": "deepseek/deepseek-chat-v3-0324:free"},
            ],
            "ollama": [
                {"name": "llama3.1 local", "value": "llama3.1"},
                {"name": "qwen3", "value": "qwen3"},
            ],
        },
    }


@router.post("/start")
async def start_analysis(body: AnalysisBatchRequest, request: Request):
    """Start a new batch analysis for the authenticated user."""
    user_id: str = request.state.user.get("sub")

    existing_task = user_analysis_tasks.get(user_id)
    if existing_task and not existing_task.done():
        raise HTTPException(status_code=409, detail="Analysis already running. Stop it first.")

    logger.info(f"Starting batch analysis for user {user_id}: {body.tickers}")
    user_manager.reset_user_session(user_id, body.tickers)

    task = asyncio.create_task(_run_batch_analysis(user_id, body))
    user_analysis_tasks[user_id] = task

    return {
        "status": "started",
        "tickers": body.tickers,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@router.post("/stop")
async def stop_analysis(request: Request):
    """Stop the currently running analysis for the authenticated user."""
    user_id: str = request.state.user.get("sub")

    task = user_analysis_tasks.get(user_id)
    if not task or task.done():
        raise HTTPException(status_code=400, detail="No analysis is currently running")

    logger.info(f"Stopping analysis for user {user_id}")
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

    return {"status": "stopped", "timestamp": datetime.utcnow().isoformat() + "Z"}
