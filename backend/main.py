from dotenv import load_dotenv
import os
from pathlib import Path
from datetime import datetime
import logging
from fastapi import FastAPI
from websocket import WebSocket
from contextlib import asynccontextmanager
from models import AnalysisState, AnalysisRequest
from services import TradingService
import asyncio
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

"""
FastAPI backend for TradingAgent real-time streaming.
"""

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / ".env"
print(f"Loading environment variables from: {env_path}")
load_dotenv(dotenv_path=env_path)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# Global state
analysis_task: Optional[asyncio.Task] = None
active_websockets: list[WebSocket] = []
current_state: AnalysisState = AnalysisState.IDLE


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown logic."""
    logger.info("Starting TradingAgent FastAPI application")
    yield
    # Cleanup on shutdown
    global analysis_task
    if analysis_task and not analysis_task.done():
        analysis_task.cancel()
    logger.info("Shutting down TradingAgent FastAPI application")


app = FastAPI(
    title="TradingAgent WebSocket API",
    description="Real-time streaming analysis from TradingAgents framework",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize trading service
trading_service = TradingService()


async def broadcast_message(message: dict):
    """Broadcast message to all connected WebSocket clients."""
    dead_sockets = []
    for ws in active_websockets:
        try:
            await ws.send_json(message)
        except Exception as e:
            logger.error(f"Error sending to websocket: {e}")
            dead_sockets.append(ws)

    # Remove dead connections
    for ws in dead_sockets:
        if ws in active_websockets:
            active_websockets.remove(ws)


async def broadcast_status(state: AnalysisState):
    """Broadcast status update to all clients."""
    global current_state
    current_state = state
    await broadcast_message({"type": "status", "state": state.value})


async def broadcast_log(message: str):
    """Broadcast log message to all clients."""
    await broadcast_message({"type": "log", "message": message, "ts": datetime.utcnow().isoformat() + "Z"})


async def run_analysis(request: AnalysisRequest):
    """
    Run the trading analysis in background.
    Streams logs via WebSocket.
    """
    try:
        await broadcast_status(AnalysisState.RUNNING)
        await broadcast_log(f"Starting analysis for {request.ticker}")
        await broadcast_log(f"Date: {request.analysis_date}")
        await broadcast_log(f"Research depth: {request.research_depth}")
        await broadcast_log(f"LLM Provider: {request.llm_provider.value}")
        await broadcast_log(f"Shallow model: {request.shallow_model}")
        await broadcast_log(f"Deep model: {request.deep_model}")

        # Run the trading analysis
        async for log_message in trading_service.run_analysis(request):
            await broadcast_log(log_message)
            # Small delay to prevent overwhelming the client
            await asyncio.sleep(0.01)

        await broadcast_status(AnalysisState.IDLE)

    except asyncio.CancelledError:
        await broadcast_log("Analysis stopped by user")
        await broadcast_status(AnalysisState.STOPPED)
        logger.info("Analysis task cancelled")
        raise  # Re-raise to properly mark task as cancelled
    except Exception as e:
        error_msg = f"Analysis failed: {str(e)}"
        logger.error(error_msg, exc_info=True)
        await broadcast_log(error_msg)
        await broadcast_status(AnalysisState.ERROR)
    finally:
        global analysis_task
        analysis_task = None


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "TradingAgent WebSocket API",
        "version": "1.0.0",
    }


@app.get("/api/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "state": current_state.value,
        "trading_mode": "real" if trading_service.is_real_mode else "mock",
        "active_connections": len(active_websockets),
    }


@app.get("/api/config")
async def get_config():
    """Get available configuration options for the frontend."""
    return {
        "tickers": [
            {"name": "Tesla", "symbol": "TSLA"},
            {"name": "Apple", "symbol": "AAPL"},
            {"name": "Microsoft", "symbol": "MSFT"},
            {"name": "NVIDIA", "symbol": "NVDA"},
            {"name": "Amazon", "symbol": "AMZN"},
            {"name": "Meta", "symbol": "META"},
            {"name": "Alphabet", "symbol": "GOOGL"},
            {"name": "Roblox", "symbol": "RBLX"},
            {"name": "Fubo", "symbol": "FUBO"},
            {"name": "SMR", "symbol": "SMR"},
            {"name": "Hims & Hers", "symbol": "HIMS"},
        ],
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
                {"name": "Meta: Llama 3.3 8B Instruct - A lightweight and ultra-fast variant of Llama 3.3 70B", "value": "meta-llama/llama-3.3-8b-instruct:free"},
                {"name": "google/gemini-2.0-flash-exp:free - Gemini Flash 2.0 offers a significantly faster time to first token", "value": "google/gemini-2.0-flash-exp:free"},
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
                {"name": "DeepSeek V3 - a 685B-parameter, mixture-of-experts model", "value": "deepseek/deepseek-chat-v3-0324:free"},
                {"name": "Deepseek - latest iteration of the flagship chat model family from the DeepSeek team.", "value": "deepseek/deepseek-chat-v3-0324:free"},
            ],
            "ollama": [
                {"name": "llama3.1 local", "value": "llama3.1"},
                {"name": "qwen3", "value": "qwen3"},
            ],
        },
    }


@app.post("/api/start")
async def start_analysis(request: AnalysisRequest):
    """
    Start a new trading analysis.
    Only one analysis can run at a time.
    """
    global analysis_task

    if analysis_task and not analysis_task.done():
        raise HTTPException(status_code=409, detail="Analysis already running. Stop it first.")

    logger.info(f"Starting analysis for {request.ticker}")
    analysis_task = asyncio.create_task(run_analysis(request))

    return {
        "status": "started",
        "ticker": request.ticker,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.post("/api/stop")
async def stop_analysis():
    """
    Stop the currently running analysis.
    """
    global analysis_task

    if not analysis_task or analysis_task.done():
        raise HTTPException(status_code=400, detail="No analysis is currently running")

    logger.info("Stopping analysis")
    analysis_task.cancel()

    # Wait for the task to actually be cancelled
    try:
        await analysis_task
    except asyncio.CancelledError:
        pass  # Expected when task is cancelled

    return {
        "status": "stopped",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time log streaming.
    """
    await websocket.accept()
    active_websockets.append(websocket)
    logger.info(f"WebSocket connected. Total connections: {len(active_websockets)}")

    # Send current state on connection
    try:
        await websocket.send_json({"type": "status", "state": current_state.value})
        await websocket.send_json(
            {
                "type": "log",
                "message": "Connected to TradingAgent WebSocket",
                "ts": datetime.utcnow().isoformat() + "Z",
            },
        )

        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Wait for any client messages (ping/pong)
                data = await websocket.receive_text()
                # Echo back for ping/pong
                if data == "ping":
                    await websocket.send_text("pong")
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                break

    finally:
        if websocket in active_websockets:
            active_websockets.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(active_websockets)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
