import asyncio
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

from . import manager
from utils.jwt_utils import decode_access_token

logger = logging.getLogger(__name__)

router = APIRouter(tags=["websocket"])

KEEPALIVE_INTERVAL = 30


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(default=None),
):
    """WebSocket endpoint for real-time log streaming (per-user, auth via ?token=)."""
    await websocket.accept()

    # Authenticate
    user_id: Optional[str] = None
    if token:
        try:
            payload = decode_access_token(token)
            user_id = payload.get("sub")
        except Exception as exc:
            logger.warning(f"WebSocket auth failed: {exc}")
            await websocket.close(code=4001, reason="Invalid token")
            return

    if not user_id:
        await websocket.close(code=4003, reason="Authentication required")
        return

    await manager.add_user_websocket(user_id, websocket)
    logger.info(f"WebSocket connected for user {user_id}")

    try:
        # 1. Current analysis state
        current_state = manager.get_user_state(user_id)
        await websocket.send_json({"type": "status", "state": current_state.value})

        # 2. Ticker progress snapshot (so UI can restore progress bars immediately)
        ticker_progress = manager.get_user_ticker_progress(user_id)
        if ticker_progress:
            await websocket.send_json({"type": "batch_status", "tickers": list(ticker_progress.values())})

        # 3. Replay log message history so the user sees what happened while away.
        #    Skip progress/result/status messages — batch_status already provides
        #    the current state snapshot, and replaying those types would re-add
        #    completed tickers to the UI on reconnect.
        for msg in manager.get_user_history(user_id):
            if msg.get("type") != "log":
                continue
            try:
                await websocket.send_json(msg)
            except Exception:
                break

        # 4. "You are connected" marker
        await websocket.send_json(
            {
                "type": "log",
                "ticker": "",
                "message": "Connected to TradingAgent WebSocket",
                "ts": datetime.utcnow().isoformat() + "Z",
            }
        )

        # Keep-alive loop
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
                logger.error(f"WebSocket error for user {user_id}: {e}")
                break

    finally:
        await manager.remove_user_websocket(user_id, websocket)
        logger.info(f"WebSocket disconnected for user {user_id}")
