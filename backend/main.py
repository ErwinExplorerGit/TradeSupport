from dotenv import load_dotenv
import os
from pathlib import Path
from datetime import datetime
import logging
from contextlib import asynccontextmanager
import asyncio
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from models import AnalysisState

# Import services
from services.trading_service import TradingService, router as trading_router
from services.trading_service.routes import set_trading_service, set_broadcast_callbacks
from services.auth_service import AuthService, router as auth_router
from services.auth_service.routes import set_auth_service
from services.history_service import HistoryService, router as history_router
from services.history_service.routes import set_history_service

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
active_websockets: list[WebSocket] = []
current_state: AnalysisState = AnalysisState.IDLE

# Initialize services
trading_service = TradingService()
auth_service = AuthService()
history_service = HistoryService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown logic."""
    logger.info("Starting TradingAgent FastAPI application")

    # Initialize services
    set_trading_service(trading_service)
    set_auth_service(auth_service)
    set_history_service(history_service)
    set_broadcast_callbacks(broadcast_status, broadcast_log)

    yield
    # Cleanup on shutdown
    logger.info("Shutting down TradingAgent FastAPI application")


app = FastAPI(
    title="TradingAgent WebSocket API",
    description="Real-time streaming analysis from TradingAgents framework",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include service routers
app.include_router(trading_router)
app.include_router(auth_router)
app.include_router(history_router)


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
    """Detailed health check for the main application."""
    return {
        "status": "healthy",
        "state": current_state.value,
        "trading_mode": "real" if trading_service.is_real_mode else "mock",
        "active_connections": len(active_websockets),
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
        # Send a keepalive ping every 30 seconds to prevent Render's
        # reverse proxy from closing idle WebSocket connections (~55s timeout).
        KEEPALIVE_INTERVAL = 30
        while True:
            try:
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=KEEPALIVE_INTERVAL,
                )
                if data == "ping":
                    await websocket.send_text("pong")
            except asyncio.TimeoutError:
                # No message received within interval — send a keepalive ping
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception:
                    break  # Connection is gone
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
