import hashlib
import os

from fastapi import APIRouter, Request, Response, HTTPException

from config.database import get_pool
from .login import LoginRequest, LoginResponse, LoginService
from .registration import RegisterRequest, RegisterResponse, register as _register, RegistrationService
from .verify_email import VerifyEmailRequest, VerifyEmailResponse, verify_email as _verify_email, VerifyEmailService
from .forgot_password import ForgotPasswordRequest, ForgotPasswordResponse, forgot_password as _forgot_password, ForgotPasswordService
from .resend_verify_email import ResendVerifyEmailRequest, ResendVerifyEmailResponse, resend_verify_email as _resend_verify_email, ResendVerifyEmailService
from .verify_reset_password_token import VerifyPasswordResetRequest, VerifyPasswordResetResponse, verify_reset_password_token as _verify_reset_password_token, VerifyPasswordResetService
from .reset_password import ResetPasswordRequest, ResetPasswordResponse, reset_password as _reset_password, ResetPasswordService
from .change_password import ChangePasswordRequest, ChangePasswordResponse, change_password as _change_password, ChangePasswordService
from .refresh_token import RefreshTokenResponse, RefreshTokenService

router = APIRouter(prefix="/api/auth", tags=["auth"])

_REFRESH_TOKEN_COOKIE = "refresh_token"
_REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60  # 7 days in seconds
_SECURE_COOKIES = os.getenv("ENVIRONMENT", "development").lower() == "production"


def _set_refresh_cookie(response: Response, raw_refresh: str) -> None:
    response.set_cookie(
        key=_REFRESH_TOKEN_COOKIE,
        value=raw_refresh,
        httponly=True,
        secure=_SECURE_COOKIES,
        samesite="lax",
        max_age=_REFRESH_TOKEN_MAX_AGE,
        path="/api/auth",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=_REFRESH_TOKEN_COOKIE,
        httponly=True,
        secure=_SECURE_COOKIES,
        samesite="lax",
        path="/api/auth",
    )


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest, response: Response):
    service = LoginService(get_pool())
    result = await service.authenticate(body.username, body.password)
    _set_refresh_cookie(response, result.pop("refresh_token"))
    return LoginResponse(message="logged in", **result)


@router.post("/register", response_model=RegisterResponse, status_code=201)
async def register(request: RegisterRequest):
    registration_service = RegistrationService(get_pool())
    return await _register(request, registration_service)


@router.post("/resend-verify-email", response_model=ResendVerifyEmailResponse)
async def resend_verify_email(request: ResendVerifyEmailRequest):
    service = ResendVerifyEmailService(get_pool())
    return await _resend_verify_email(request, service)


@router.post("/verify-email", response_model=VerifyEmailResponse)
async def verify_email(request: VerifyEmailRequest):
    service = VerifyEmailService(get_pool())
    return await _verify_email(request, service)


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(request: ForgotPasswordRequest):
    service = ForgotPasswordService(get_pool())
    return await _forgot_password(request, service)


@router.post("/verify-reset-password-token", response_model=VerifyPasswordResetResponse)
async def verify_reset_password_token(request: VerifyPasswordResetRequest):
    service = VerifyPasswordResetService(get_pool())
    return await _verify_reset_password_token(request, service)


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(request: ResetPasswordRequest):
    service = ResetPasswordService(get_pool())
    return await _reset_password(request, service)


@router.post("/change-password", response_model=ChangePasswordResponse)
async def change_password(request: Request, body: ChangePasswordRequest):
    service = ChangePasswordService(get_pool())
    return await _change_password(request, body, service)


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(request: Request, response: Response):
    raw_refresh = request.cookies.get(_REFRESH_TOKEN_COOKIE)
    if not raw_refresh:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    service = RefreshTokenService(get_pool())
    result = await service.refresh(raw_refresh)
    _set_refresh_cookie(response, result["refresh_token"])
    return RefreshTokenResponse(access_token=result["access_token"])


@router.post("/logout", status_code=204)
async def logout(request: Request, response: Response):
    """Invalidate the refresh token cookie and clear it from the database."""
    raw_refresh = request.cookies.get(_REFRESH_TOKEN_COOKIE)
    if raw_refresh:
        token_hash = hashlib.sha256(raw_refresh.encode()).hexdigest()
        async with get_pool().acquire() as conn:
            await conn.execute(
                """
                UPDATE users
                SET refresh_token_hash = NULL,
                    refresh_expires_at = NULL,
                    updated_at = NOW()
                WHERE refresh_token_hash = $1
                """,
                token_hash,
            )
    _clear_refresh_cookie(response)
