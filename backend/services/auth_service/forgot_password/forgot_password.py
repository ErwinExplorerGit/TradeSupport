import logging

from pydantic import BaseModel, field_validator

from utils.email_utils import is_valid_email
from utils.send_email import send_email
from .services import ForgotPasswordService, _APP_URL, _RESET_EXPIRY_MINUTES

logger = logging.getLogger(__name__)


class ForgotPasswordRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def email_valid(cls, v: str) -> str:
        if not is_valid_email(v):
            raise ValueError("Invalid email address")
        return v.lower()


class ForgotPasswordResponse(BaseModel):
    message: str


async def forgot_password(
    request: ForgotPasswordRequest,
    service: ForgotPasswordService,
) -> ForgotPasswordResponse:
    """Send a password-reset email if the account exists and is eligible."""
    user = await service.get_active_user(request.email)

    # Always return the same response to avoid leaking account existence.
    if user is None:
        logger.info("Password reset requested for unknown/ineligible email: %s", request.email)
        return ForgotPasswordResponse(message="If that email is registered, a reset link has been sent")

    raw_token = await service.create_reset_token(request.email)
    logger.info("Password reset token issued for: %s", request.email)

    reset_url = f"{_APP_URL}/reset-password?token={raw_token}"
    await send_email(
        to=request.email,
        subject="Reset your TradeSupport password",
        template="reset_password.html",
        context={
            "first_name": user["first_name"],
            "reset_url": reset_url,
            "expiry_minutes": _RESET_EXPIRY_MINUTES,
        },
    )

    return ForgotPasswordResponse(message="If that email is registered, a reset link has been sent")
