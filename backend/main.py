from dotenv import load_dotenv
import os
from pathlib import Path
import logging
from contextlib import asynccontextmanager

# Load environment variables before any config/service imports so that
# module-level config objects (e.g. SMTPConfig, database DSN) read the
# correct values from .env on first access.
_env_path = Path(__file__).resolve().parent / ".env"
print(f"Loading environment variables from: {_env_path}")
load_dotenv(dotenv_path=_env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import database
from config.database import init_db, close_db
from config.smtp import init_smtp

# Import services
from services.trading_service import TradingService, router as trading_router
from services.trading_service.routes import set_trading_service, set_broadcast_callbacks
from services.auth_service import router as auth_router
from services.history_service import HistoryService, router as history_router
from services.history_service.routes import set_history_service
from services.socket_service import router as socket_router, broadcast_status, broadcast_log
from services.socket_service import manager as socket_manager
from services.health_service import router as health_router, set_health_callbacks
from middleware.middleware import Middleware

"""
FastAPI backend for TradingAgent real-time streaming.
"""

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# Initialize services
trading_service = TradingService()
history_service = HistoryService()


# TODO: Should i remove lifespan after finishing the app?
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown logic."""
    logger.info("Starting TradingAgent FastAPI application")

    # Initialize services
    set_trading_service(trading_service)
    set_history_service(history_service)
    set_broadcast_callbacks(broadcast_status, broadcast_log)
    set_health_callbacks(
        get_state=lambda: socket_manager.current_state.value,
        get_trading_mode=lambda: "real" if trading_service.is_real_mode else "mock",
        get_active_connections=lambda: len(socket_manager.active_websockets),
    )

    # Initialise database connection pool
    await init_db()

    # Validate SMTP configuration
    init_smtp()

    yield

    # Cleanup on shutdown
    await close_db()
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

# Include middleware
app.add_middleware(Middleware)

# Include service routers
app.include_router(auth_router)

app.include_router(trading_router)
app.include_router(history_router)
app.include_router(socket_router)
app.include_router(health_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
