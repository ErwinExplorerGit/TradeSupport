import logging

from pydantic import BaseModel

from .login_service import LoginService

logger = logging.getLogger(__name__)


class LoginRequest(BaseModel):
    username: str  # treated as email
    password: str


class LoginResponse(BaseModel):
    message: str
    user_id: str
    email: str
    first_name: str
    last_name: str
    access_token: str


async def login(request: LoginRequest, login_service: LoginService) -> LoginResponse:
    """Authenticate a user and return JWT access + opaque refresh tokens."""
    result = await login_service.authenticate(request.username, request.password)
    logger.info(f"Successful login for user: {result['email']}")
    return LoginResponse(message="logged in", **result)
