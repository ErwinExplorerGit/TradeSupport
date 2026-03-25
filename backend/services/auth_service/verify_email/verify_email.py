import logging

from fastapi import HTTPException
from pydantic import BaseModel

from .services import VerifyEmailService

logger = logging.getLogger(__name__)


class VerifyEmailRequest(BaseModel):
    token: str


class VerifyEmailResponse(BaseModel):
    message: str


async def verify_email(
    request: VerifyEmailRequest,
    service: VerifyEmailService,
) -> VerifyEmailResponse:
    """Verify a user account using the token delivered by email."""
    success = await service.verify_token(request.token)
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification token",
        )
    logger.info("Account verified successfully via token")
    return VerifyEmailResponse(message="Account verified successfully")
