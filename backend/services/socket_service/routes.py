import asyncio
import logging
from datetime import datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from . import manager

logger = logging.getLogger(__name__)

router = APIRouter(tags=["websocket"])

KEEPALIVE_INTERVAL = 30


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time log streaming."""
    await websocket.accept()
    manager.active_websockets.append(websocket)
    logger.info(f"WebSocket connected. Total connections: {len(manager.active_websockets)}")

    try:
        await websocket.send_json({"type": "status", "state": manager.current_state.value})
        await websocket.send_json(
            {
                "type": "log",
                "message": "Connected to TradingAgent WebSocket",
                "ts": datetime.utcnow().isoformat() + "Z",
            }
        )

        while True:
            try:
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=KEEPALIVE_INTERVAL,
                )
                if data == "ping":
                    await websocket.send_text("pong")
            except asyncio.TimeoutError:
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception:
                    break
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                break

    finally:
        if websocket in manager.active_websockets:
            manager.active_websockets.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(manager.active_websockets)}")
