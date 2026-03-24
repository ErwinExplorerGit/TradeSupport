import logging

from fastapi import HTTPException
from pydantic import BaseModel

from .services import VerifyService

logger = logging.getLogger(__name__)


class VerifyRequest(BaseModel):
    token: str


class VerifyResponse(BaseModel):
    message: str


async def verify(
    request: VerifyRequest,
    service: VerifyService,
) -> VerifyResponse:
    """Verify a user account using the token delivered by email."""
    success = await service.verify_token(request.token)
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification token",
        )
    logger.info("Account verified successfully via token")
    return VerifyResponse(message="Account verified successfully")
