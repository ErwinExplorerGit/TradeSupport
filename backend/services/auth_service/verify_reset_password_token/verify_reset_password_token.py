import logging

from fastapi import HTTPException, status
from pydantic import BaseModel

from .services import VerifyPasswordResetService

logger = logging.getLogger(__name__)


class VerifyPasswordResetRequest(BaseModel):
    token: str


class VerifyPasswordResetResponse(BaseModel):
    message: str


async def verify_reset_password_token(
    request: VerifyPasswordResetRequest,
    service: VerifyPasswordResetService,
) -> VerifyPasswordResetResponse:
    """Validate the reset token; raise 400 if expired or not found."""
    valid = await service.validate_token(request.token)

    if not valid:
        logger.info("Invalid or expired password-reset token presented")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token is invalid or has expired",
        )

    logger.info("Password reset token validated successfully")
    return VerifyPasswordResetResponse(message="Token is valid")
