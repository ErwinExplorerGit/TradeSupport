from fastapi import HTTPException
from pydantic import BaseModel, field_validator
import logging

from utils.email_utils import is_valid_email
from utils.send_email import send_email
from .services import RegistrationService, _APP_URL, _VERIFY_EXPIRY_HOURS

logger = logging.getLogger(__name__)


class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def email_valid(cls, v: str) -> str:
        if not is_valid_email(v):
            raise ValueError("Invalid email address")
        return v.lower()

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("first_name", "last_name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field must not be blank")
        return v.strip()


class RegisterResponse(BaseModel):
    message: str
    user_id: str
    email: str


async def register(request: RegisterRequest, registration_service: RegistrationService) -> RegisterResponse:
    """Register a new user, persisting to the database."""
    if not registration_service:
        raise HTTPException(status_code=500, detail="Auth service not initialized")

    if await registration_service.user_exists(request.email):
        logger.warning(f"Registration attempt for existing email: {request.email}")
        raise HTTPException(status_code=409, detail="Email already registered")

    user_id, raw_token = await registration_service.register_user(
        request.first_name,
        request.last_name,
        request.email,
        request.password,
    )
    logger.info(f"Registered new user: {request.email} (id={user_id})")

    verification_url = f"{_APP_URL}/verify-email?token={raw_token}"
    await send_email(
        to=request.email,
        subject="Verify your TradeSupport account",
        template="verify_account.html",
        context={
            "first_name": request.first_name,
            "verification_url": verification_url,
            "expiry_hours": _VERIFY_EXPIRY_HOURS,
        },
    )

    return RegisterResponse(message="registered", user_id=user_id, email=request.email)
