from fastapi import APIRouter

from config.database import get_pool
from utils.bcrypt_utils import hash_password
from .login import LoginRequest, LoginResponse, login as _login, LoginService
from .registration import RegisterRequest, RegisterResponse, register as _register, RegistrationService
from .verify import VerifyRequest, VerifyResponse, verify as _verify, VerifyService
from .verify_resend import VerifyResendRequest, VerifyResendResponse, verify_resend as _verify_resend, VerifyResendService
from .forgot_password import ForgotPasswordRequest, ForgotPasswordResponse, forgot_password as _forgot_password, ForgotPasswordService
from .verify_password_reset import VerifyPasswordResetRequest, VerifyPasswordResetResponse, verify_password_reset as _verify_password_reset, VerifyPasswordResetService

router = APIRouter(prefix="/api/auth", tags=["auth"])


# In-memory user store for login (mock) — seeded with demo accounts
_users: dict[str, str] = {
    "admin": hash_password("admin123"),
    "user": hash_password("user123"),
    "demo": hash_password("demo123"),
}

_login_service = LoginService(_users)


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    return await _login(request, _login_service)


@router.post("/register", response_model=RegisterResponse, status_code=201)
async def register(request: RegisterRequest):
    registration_service = RegistrationService(get_pool())
    return await _register(request, registration_service)


@router.post("/verify/resend", response_model=VerifyResendResponse)
async def verify_resend(request: VerifyResendRequest):
    service = VerifyResendService(get_pool())
    return await _verify_resend(request, service)


@router.post("/verify", response_model=VerifyResponse)
async def verify(request: VerifyRequest):
    service = VerifyService(get_pool())
    return await _verify(request, service)


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(request: ForgotPasswordRequest):
    service = ForgotPasswordService(get_pool())
    return await _forgot_password(request, service)


@router.post("/verify-password-reset", response_model=VerifyPasswordResetResponse)
async def verify_password_reset(request: VerifyPasswordResetRequest):
    service = VerifyPasswordResetService(get_pool())
    return await _verify_password_reset(request, service)
