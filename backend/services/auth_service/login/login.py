from fastapi import HTTPException
from pydantic import BaseModel
import logging

from .login_service import LoginService

logger = logging.getLogger(__name__)


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    message: str
    username: str


async def login(request: LoginRequest, login_service: LoginService) -> LoginResponse:
    """Mock login handler. Validates credentials against the in-memory store."""
    if not login_service:
        raise HTTPException(status_code=500, detail="Auth service not initialized")

    if login_service.authenticate(request.username, request.password):
        logger.info(f"Successful login for user: {request.username}")
        return LoginResponse(message="logged in", username=request.username)

    logger.warning(f"Failed login attempt for user: {request.username}")
    raise HTTPException(status_code=401, detail="Invalid credentials")
