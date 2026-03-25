import logging

from fastapi import HTTPException, Request, status
from pydantic import BaseModel, field_validator

from .services import ChangePasswordService

logger = logging.getLogger(__name__)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("New password must be at least 8 characters")
        return v


class ChangePasswordResponse(BaseModel):
    message: str


async def change_password(
    request: Request,
    body: ChangePasswordRequest,
    service: ChangePasswordService,
) -> ChangePasswordResponse:
    """Change the authenticated user's password."""
    user = getattr(request.state, "user", None)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_id: str = user.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    await service.change_password(user_id, body.current_password, body.new_password)
    return ChangePasswordResponse(message="Password changed successfully")
