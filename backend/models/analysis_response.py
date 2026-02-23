from typing import Optional
from pydantic import BaseModel


class AnalysisResponse(BaseModel):
    """Response model for analysis operations."""

    status: str
    ticker: Optional[str] = None
    timestamp: str
    message: Optional[str] = None
