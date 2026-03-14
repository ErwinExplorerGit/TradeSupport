from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging

from .service import AuthService

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/auth", tags=["auth"])

# Service instance (will be set by main.py)
auth_service: Optional[AuthService] = None


def set_auth_service(service: AuthService):
    """Set the auth service instance."""
    global auth_service
    auth_service = service


class LoginRequest(BaseModel):
    """Login request model."""

    username: str
    password: str


class LoginResponse(BaseModel):
    """Login response model."""

    message: str
    username: str


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Login endpoint with hardcoded credentials.

    Hardcoded credentials:
    - admin / admin123
    - user / user123
    - demo / demo123
    """
    if not auth_service:
        raise HTTPException(status_code=500, detail="Auth service not initialized")

    if auth_service.authenticate(request.username, request.password):
        logger.info(f"Successful login for user: {request.username}")
        return LoginResponse(message="logged in", username=request.username)
    else:
        logger.warning(f"Failed login attempt for user: {request.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
