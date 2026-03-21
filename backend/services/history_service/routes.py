from fastapi import APIRouter
from typing import Optional
import logging

from .service import HistoryService

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/history", tags=["history"])

# Service instance (will be set by main.py)
history_service: Optional[HistoryService] = None


def set_history_service(service: HistoryService):
    """Set the history service instance."""
    global history_service
    history_service = service


@router.get("/{userid}/{ticker}")
async def get_history(userid: str, ticker: str):
    """
    Get trading history for a specific user and ticker.

    Args:
        userid: The user ID
        ticker: The stock ticker symbol

    Returns:
        Dictionary with userid and ticker
    """
    if not history_service:
        return {"error": "History service not initialized"}

    result = history_service.get_history(userid, ticker)
    logger.info(f"History retrieved for user {userid} and ticker {ticker}")

    return result
