from fastapi import APIRouter, Request, Query
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


@router.get("")
async def get_history(
    request: Request,
    q: Optional[str] = Query(None, description="Filter by ticker or company name"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """
    Get paginated scan history for the authenticated user.
    Optionally filter by ticker symbol or company name.
    """
    if not history_service:
        return {"error": "History service not initialized"}

    user_id: str = request.state.user.get("sub")
    result = await history_service.get_history(
        user_id=user_id,
        q=q,
        page=page,
        page_size=page_size,
    )
    logger.info(f"History retrieved for user {user_id} (q={q!r}, page={page})")
    return result
