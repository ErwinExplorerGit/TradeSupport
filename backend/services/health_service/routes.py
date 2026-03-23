from typing import Callable, Optional

from fastapi import APIRouter

router = APIRouter(tags=["health"])

# Callbacks set by main.py
_get_state: Optional[Callable[[], str]] = None
_get_trading_mode: Optional[Callable[[], str]] = None
_get_active_connections: Optional[Callable[[], int]] = None


def set_health_callbacks(
    get_state: Callable[[], str],
    get_trading_mode: Callable[[], str],
    get_active_connections: Callable[[], int],
):
    global _get_state, _get_trading_mode, _get_active_connections
    _get_state = get_state
    _get_trading_mode = get_trading_mode
    _get_active_connections = get_active_connections


@router.get("/api/health")
async def health_check():
    """Detailed health check for the main application."""
    return {
        "status": "healthy",
        "state": _get_state() if _get_state else "unknown",
        "trading_mode": _get_trading_mode() if _get_trading_mode else "unknown",
        "active_connections": _get_active_connections() if _get_active_connections else 0,
    }
