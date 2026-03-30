"""
Unit tests for services/auth_service — registration and login models/logic.

All database I/O is replaced with mocks so these tests run without a real
PostgreSQL instance.

Covers RegisterRequest validation:
- email is lowercased and validated
- password minimum length
- first_name / last_name blank rejection

Covers LoginService.authenticate branches:
- Unknown user → 401
- Inactive account → 403
- Unverified account → 403
- Locked account → 403
- Wrong password → 401
- Successful authentication returns expected keys
"""

import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from services.auth_service.registration.registration import RegisterRequest
from services.auth_service.login.login_service import LoginService


# ─────────────────────────── RegisterRequest ──────────────────────────────────


@pytest.mark.unit
class TestRegisterRequest:
    def _make(self, **overrides) -> RegisterRequest:
        defaults = {
            "first_name": "Alice",
            "last_name": "Smith",
            "email": "alice@example.com",
            "password": "strongpassword123",
        }
        defaults.update(overrides)
        return RegisterRequest(**defaults)

    # ── email ──────────────────────────────────────────────────────────────────
    def test_email_lowercased(self):
        req = self._make(email="Alice@EXAMPLE.COM")
        assert req.email == "alice@example.com"

    def test_invalid_email_raises(self):
        with pytest.raises(ValidationError):
            self._make(email="not-an-email")

    # ── password ───────────────────────────────────────────────────────────────
    def test_password_too_short_raises(self):
        with pytest.raises(ValidationError):
            self._make(password="short")

    def test_password_exactly_8_chars_accepted(self):
        req = self._make(password="exact8ch")
        assert len(req.password) == 8

    # ── name fields ────────────────────────────────────────────────────────────
    def test_blank_first_name_raises(self):
        with pytest.raises(ValidationError):
            self._make(first_name="   ")

    def test_blank_last_name_raises(self):
        with pytest.raises(ValidationError):
            self._make(last_name="")

    def test_name_extra_whitespace_stripped(self):
        req = self._make(first_name="  Bob  ", last_name="  Jones  ")
        assert req.first_name == "Bob"
        assert req.last_name == "Jones"


# ─────────────────────────── LoginService ─────────────────────────────────────


def _build_user_row(
    *,
    is_active: bool = True,
    is_verified: bool = True,
    is_locked: bool = False,
    failed_login_count: int = 0,
    password_hash: str | None = None,
) -> dict:
    """Build a fake asyncpg Row-like dict for a user record."""
    from utils.bcrypt_utils import hash_password

    return {
        "id": uuid.uuid4(),
        "first_name": "Alice",
        "last_name": "Smith",
        "email": "alice@example.com",
        "password_hash": password_hash or hash_password("correctpassword"),
        "is_active": is_active,
        "is_verified": is_verified,
        "is_locked": is_locked,
        "failed_login_count": failed_login_count,
    }


@pytest.mark.unit
class TestLoginService:
    """Tests for LoginService.authenticate using a mocked asyncpg pool."""

    def _make_service(self, fetchrow_return):
        """Return a LoginService whose pool.acquire conn returns the given row."""
        conn = AsyncMock()
        conn.fetchrow = AsyncMock(return_value=fetchrow_return)
        conn.execute = AsyncMock(return_value=None)

        pool = MagicMock()
        pool.acquire.return_value.__aenter__ = AsyncMock(return_value=conn)
        pool.acquire.return_value.__aexit__ = AsyncMock(return_value=False)
        return LoginService(pool)

    @pytest.mark.asyncio
    async def test_unknown_user_raises_401(self):
        service = self._make_service(fetchrow_return=None)
        with pytest.raises(HTTPException) as exc_info:
            await service.authenticate("ghost@example.com", "whatever")
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_inactive_account_raises_403(self):
        row = _build_user_row(is_active=False)
        service = self._make_service(fetchrow_return=row)
        with pytest.raises(HTTPException) as exc_info:
            await service.authenticate("alice@example.com", "correctpassword")
        assert exc_info.value.status_code == 403
        assert "deactivated" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_unverified_account_raises_403(self):
        row = _build_user_row(is_verified=False)
        service = self._make_service(fetchrow_return=row)
        with pytest.raises(HTTPException) as exc_info:
            await service.authenticate("alice@example.com", "correctpassword")
        assert exc_info.value.status_code == 403
        assert "verified" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_locked_account_raises_403(self):
        row = _build_user_row(is_locked=True)
        service = self._make_service(fetchrow_return=row)
        with pytest.raises(HTTPException) as exc_info:
            await service.authenticate("alice@example.com", "correctpassword")
        assert exc_info.value.status_code == 403
        assert "locked" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_wrong_password_raises_401(self):
        row = _build_user_row()
        service = self._make_service(fetchrow_return=row)
        with pytest.raises(HTTPException) as exc_info:
            await service.authenticate("alice@example.com", "wrongpassword")
        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_successful_auth_returns_expected_keys(self):
        row = _build_user_row()
        service = self._make_service(fetchrow_return=row)
        result = await service.authenticate("alice@example.com", "correctpassword")
        assert "access_token" in result
        assert "refresh_token" in result
        assert "user_id" in result
        assert "email" in result
        assert result["email"] == "alice@example.com"

    @pytest.mark.asyncio
    async def test_successful_auth_access_token_is_string(self):
        row = _build_user_row()
        service = self._make_service(fetchrow_return=row)
        result = await service.authenticate("alice@example.com", "correctpassword")
        assert isinstance(result["access_token"], str)
        assert result["access_token"].count(".") == 2  # valid JWT structure
