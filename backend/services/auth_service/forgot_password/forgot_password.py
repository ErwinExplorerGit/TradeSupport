import logging
from typing import Optional

from fastapi import HTTPException
from pydantic import BaseModel, field_validator, model_validator

from utils.email_utils import is_valid_email
from utils.send_email import send_email
from .services import ForgotPasswordService, _APP_URL, _RESET_EXPIRY_MINUTES

logger = logging.getLogger(__name__)

_GENERIC_RESPONSE = "If that email is registered, a reset link has been sent"


class ForgotPasswordRequest(BaseModel):
    email: Optional[str] = None
    token: Optional[str] = None

    @field_validator("email", mode="before")
    @classmethod
    def email_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        if not is_valid_email(v):
            raise ValueError("Invalid email address")
        return v.lower()

    @model_validator(mode="after")
    def at_least_one_field(self) -> "ForgotPasswordRequest":
        if not self.email and not self.token:
            raise ValueError("Either 'email' or 'token' must be provided")
        return self


class ForgotPasswordResponse(BaseModel):
    message: str


async def _send_reset_email(email: str, first_name: str, service: ForgotPasswordService) -> None:
    raw_token = await service.create_reset_token(email)
    reset_url = f"{_APP_URL}/reset-password?token={raw_token}"
    await send_email(
        to=email,
        subject="Reset your TradeSupport password",
        template="reset_password.html",
        context={
            "first_name": first_name,
            "reset_url": reset_url,
            "expiry_minutes": _RESET_EXPIRY_MINUTES,
        },
    )


async def forgot_password(
    request: ForgotPasswordRequest,
    service: ForgotPasswordService,
) -> ForgotPasswordResponse:
    """Send a password-reset email via email address or existing reset token."""

    if request.token:
        user = await service.get_user_by_token(request.token)
        if user is None:
            logger.info("Password reset via token failed: invalid or expired token")
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        logger.info("Password reset email re-sent via token for: %s", user["email"])
        await _send_reset_email(user["email"], user["first_name"], service)
        return ForgotPasswordResponse(message=_GENERIC_RESPONSE)

    # email path
    user = await service.get_active_user(request.email)  # type: ignore[arg-type]
    if user is None:
        logger.info("Password reset requested for unknown/ineligible email: %s", request.email)
        return ForgotPasswordResponse(message=_GENERIC_RESPONSE)

    logger.info("Password reset token issued for: %s", request.email)
    await _send_reset_email(request.email, user["first_name"], service)  # type: ignore[arg-type]
    return ForgotPasswordResponse(message=_GENERIC_RESPONSE)
