from fastapi import APIRouter

from config.database import get_pool
from .login import LoginRequest, LoginResponse, login as _login, LoginService
from .registration import RegisterRequest, RegisterResponse, register as _register, RegistrationService
from .verify_email import VerifyEmailRequest, VerifyEmailResponse, verify_email as _verify_email, VerifyEmailService
from .forgot_password import ForgotPasswordRequest, ForgotPasswordResponse, forgot_password as _forgot_password, ForgotPasswordService
from .resend_verify_email import ResendVerifyEmailRequest, ResendVerifyEmailResponse, resend_verify_email as _resend_verify_email, ResendVerifyEmailService
from .verify_reset_password_token import VerifyPasswordResetRequest, VerifyPasswordResetResponse, verify_reset_password_token as _verify_reset_password_token, VerifyPasswordResetService
from .reset_password import ResetPasswordRequest, ResetPasswordResponse, reset_password as _reset_password, ResetPasswordService

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    service = LoginService(get_pool())
    return await _login(request, service)


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
