import logging
from datetime import datetime

from fastapi import WebSocket

from models import AnalysisState

logger = logging.getLogger(__name__)

# ── Per-user state ─────────────────────────────────────────────────────────────
# user_id -> list of active WebSocket connections
user_websockets: dict[str, list[WebSocket]] = {}
# user_id -> last N messages (for replay on reconnect)
user_message_history: dict[str, list[dict]] = {}
# user_id -> current AnalysisState
user_analysis_state: dict[str, AnalysisState] = {}
# user_id -> {ticker: {ticker, percentage, step, status, decision}}
user_ticker_progress: dict[str, dict] = {}

MAX_HISTORY = 300


# ── History helpers ─────────────────────────────────────────────────────────────


def _save_to_history(user_id: str, message: dict) -> None:
    history = user_message_history.setdefault(user_id, [])
    history.append(message)
    if len(history) > MAX_HISTORY:
        user_message_history[user_id] = history[-MAX_HISTORY:]


# ── Connection management ───────────────────────────────────────────────────────


async def add_user_websocket(user_id: str, ws: WebSocket) -> None:
    user_websockets.setdefault(user_id, []).append(ws)


async def remove_user_websocket(user_id: str, ws: WebSocket) -> None:
    lst = user_websockets.get(user_id, [])
    if ws in lst:
        lst.remove(ws)


# ── Broadcast helpers ───────────────────────────────────────────────────────────


async def _send_to_user(user_id: str, message: dict) -> None:
    """Send a message to all WS connections for a user (no history save)."""
    dead: list[WebSocket] = []
    for ws in list(user_websockets.get(user_id, [])):
        try:
            await ws.send_json(message)
        except Exception as e:
            logger.error(f"Error sending to websocket for user {user_id}: {e}")
            dead.append(ws)
    for ws in dead:
        await remove_user_websocket(user_id, ws)


async def broadcast_to_user(user_id: str, message: dict) -> None:
    """Save to history then send to all connections."""
    _save_to_history(user_id, message)
    await _send_to_user(user_id, message)


async def broadcast_user_status(user_id: str, state: AnalysisState) -> None:
    user_analysis_state[user_id] = state
    await broadcast_to_user(user_id, {"type": "status", "state": state.value})


async def broadcast_user_log(user_id: str, ticker: str, message: str) -> None:
    await broadcast_to_user(
        user_id,
        {
            "type": "log",
            "ticker": ticker,
            "message": message,
            "ts": datetime.utcnow().isoformat() + "Z",
        },
    )


async def broadcast_user_progress(user_id: str, ticker: str, percentage: int, step: str, analysis_date: str = "") -> None:
    key = f"{ticker}:{analysis_date}" if analysis_date else ticker
    progress = user_ticker_progress.setdefault(user_id, {}).setdefault(key, {"ticker": ticker, "analysis_date": analysis_date, "percentage": 0, "step": "Queued", "status": "pending", "decision": None})
    progress["percentage"] = percentage
    progress["step"] = step
    if percentage >= 100:
        progress["status"] = "done"
    elif percentage < 0:
        progress["status"] = "error"
    else:
        progress["status"] = "running"

    await broadcast_to_user(
        user_id,
        {
            "type": "progress",
            "ticker": ticker,
            "analysis_date": analysis_date,
            "percentage": percentage,
            "step": step,
            "status": progress["status"],
        },
    )


async def broadcast_user_result(user_id: str, ticker: str, decision: str, analysis_date: str = "") -> None:
    key = f"{ticker}:{analysis_date}" if analysis_date else ticker
    progress = user_ticker_progress.setdefault(user_id, {}).get(key, {})
    if progress:
        progress["decision"] = decision
    await broadcast_to_user(user_id, {"type": "result", "ticker": ticker, "analysis_date": analysis_date, "decision": decision})


# ── Query helpers ───────────────────────────────────────────────────────────────


def get_user_history(user_id: str) -> list[dict]:
    return user_message_history.get(user_id, [])


def get_user_state(user_id: str) -> AnalysisState:
    return user_analysis_state.get(user_id, AnalysisState.IDLE)


def get_user_ticker_progress(user_id: str) -> dict:
    return user_ticker_progress.get(user_id, {})


def reset_user_session(user_id: str, ticker_dates: list[tuple[str, str]]) -> None:
    """Start a fresh session — clears history and initialises progress."""
    user_message_history[user_id] = []
    user_ticker_progress[user_id] = {f"{t}:{d}": {"ticker": t, "analysis_date": d, "percentage": 0, "step": "Queued", "status": "pending", "decision": None} for t, d in ticker_dates}


def register_ticker(user_id: str, ticker: str, analysis_date: str = "") -> None:
    """Add a single ticker to progress without resetting existing entries."""
    key = f"{ticker}:{analysis_date}" if analysis_date else ticker
    user_ticker_progress.setdefault(user_id, {})[key] = {"ticker": ticker, "analysis_date": analysis_date, "percentage": 0, "step": "Queued", "status": "pending", "decision": None}


# ── Legacy shims (kept so existing imports don't break) ────────────────────────

active_websockets: list[WebSocket] = []
current_state: AnalysisState = AnalysisState.IDLE


async def broadcast_status(state: AnalysisState) -> None:
    global current_state
    current_state = state


async def broadcast_log(message: str) -> None:
    pass
