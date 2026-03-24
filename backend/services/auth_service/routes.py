from fastapi import APIRouter

from config.database import get_pool
from utils.bcrypt_utils import hash_password
from .login import LoginRequest, LoginResponse, login as _login, LoginService
from .registration import RegisterRequest, RegisterResponse, register as _register, RegistrationService

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
