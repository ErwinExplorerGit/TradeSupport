import logging

from fastapi import HTTPException, status
from pydantic import BaseModel, field_validator

from .services import ResetPasswordService

logger = logging.getLogger(__name__)


class ResetPasswordRequest(BaseModel):
    token: str
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class ResetPasswordResponse(BaseModel):
    message: str


async def reset_password(
    request: ResetPasswordRequest,
    service: ResetPasswordService,
) -> ResetPasswordResponse:
    """Reset a user's password using the token from the reset email."""
    success = await service.reset_password(request.token, request.password)

    if not success:
        logger.info("Password reset failed: invalid or expired token")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token is invalid or has expired",
        )

    logger.info("Password reset successfully")
    return ResetPasswordResponse(message="Password reset successfully")
