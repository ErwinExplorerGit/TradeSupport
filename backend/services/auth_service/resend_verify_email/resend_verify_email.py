import logging

from fastapi import HTTPException
from pydantic import BaseModel, field_validator

from utils.email_utils import is_valid_email
from utils.send_email import send_email
from .services import ResendVerifyEmailService, _APP_URL, _VERIFY_EXPIRY_HOURS

logger = logging.getLogger(__name__)


class ResendVerifyEmailRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def email_valid(cls, v: str) -> str:
        if not is_valid_email(v):
            raise ValueError("Invalid email address")
        return v.lower()


class ResendVerifyEmailResponse(BaseModel):
    message: str


async def resend_verify_email(
    request: ResendVerifyEmailRequest,
    service: ResendVerifyEmailService,
) -> ResendVerifyEmailResponse:
    """Resend a verification email to an unverified user."""
    user = await service.get_unverified_user(request.email)
    if user is None:
        # Return 404 for both "not found" and "already verified" to avoid
        # leaking account existence to unauthenticated callers.
        raise HTTPException(
            status_code=404,
            detail="No unverified account found for that email address",
        )

    raw_token = await service.refresh_verification_token(request.email)
    logger.info(f"Verification token refreshed for: {request.email}")

    verification_url = f"{_APP_URL}/verify-account?token={raw_token}"
    await send_email(
        to=request.email,
        subject="Verify your TradeSupport account",
        template="verify_account.html",
        context={
            "first_name": user["first_name"],
            "verification_url": verification_url,
            "expiry_hours": _VERIFY_EXPIRY_HOURS,
        },
    )

    return ResendVerifyEmailResponse(message="Verification email resent")
