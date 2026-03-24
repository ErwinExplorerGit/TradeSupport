import logging
from datetime import datetime

from fastapi import WebSocket

from models import AnalysisState

logger = logging.getLogger(__name__)

active_websockets: list[WebSocket] = []
current_state: AnalysisState = AnalysisState.IDLE


async def broadcast_message(message: dict):
    """Broadcast message to all connected WebSocket clients."""
    dead_sockets = []
    for ws in active_websockets:
        try:
            await ws.send_json(message)
        except Exception as e:
            logger.error(f"Error sending to websocket: {e}")
            dead_sockets.append(ws)

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
