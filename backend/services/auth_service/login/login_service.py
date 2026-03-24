import hashlib
import logging
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from asyncpg import Pool
from fastapi import HTTPException

from utils.bcrypt_utils import verify_password
from utils.jwt_utils import create_access_token

logger = logging.getLogger(__name__)

_MAX_FAILED_ATTEMPTS = 5
_REFRESH_TOKEN_EXPIRY_DAYS = 7

# Dummy hash used for timing-safe rejection when the user does not exist
_DUMMY_HASH = "$2b$12$" + "x" * 53


class LoginService:
    """Handles authentication against the PostgreSQL database."""

    def __init__(self, pool: Pool):
        self._pool = pool

    async def authenticate(self, email: str, plain_password: str) -> dict:
        """
        Validate credentials and, on success, issue tokens.

        Returns a dict with user info and tokens.
        Raises HTTPException on any failure.
        """
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, first_name, last_name, email, password_hash,
                       is_active, is_verified, is_locked, failed_login_count
                FROM users
                WHERE email = $1
                """,
                email.lower(),
            )

        if row is None:
            # Perform a dummy verify to prevent user-enumeration via timing
            verify_password(plain_password, _DUMMY_HASH)
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not row["is_active"]:
            raise HTTPException(status_code=403, detail="Account is deactivated")

        if not row["is_verified"]:
            raise HTTPException(status_code=403, detail="Account email is not verified")

        if row["is_locked"]:
            raise HTTPException(status_code=403, detail="Account is locked due to too many failed attempts")

        if not verify_password(plain_password, row["password_hash"]):
            await self._record_failed_attempt(row["id"], row["failed_login_count"])
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user_id: uuid.UUID = row["id"]
        access_token = create_access_token({"sub": str(user_id), "email": row["email"]})

        raw_refresh = secrets.token_hex(32)
        refresh_hash = hashlib.sha256(raw_refresh.encode()).hexdigest()
        refresh_expires = datetime.now(timezone.utc) + timedelta(days=_REFRESH_TOKEN_EXPIRY_DAYS)

        async with self._pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE users
                SET failed_login_count = 0,
                    refresh_token_hash = $2,
                    refresh_expires_at = $3,
                    updated_at         = NOW()
                WHERE id = $1
                """,
                user_id,
                refresh_hash,
                refresh_expires,
            )

        return {
            "user_id": str(user_id),
            "email": row["email"],
            "first_name": row["first_name"],
            "last_name": row["last_name"],
            "access_token": access_token,
            "refresh_token": raw_refresh,
        }

    async def _record_failed_attempt(self, user_id: uuid.UUID, current_count: int) -> None:
        """Increment the failed login counter and lock the account if the threshold is reached."""
        new_count = current_count + 1
        locked = new_count >= _MAX_FAILED_ATTEMPTS
        async with self._pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE users
                SET failed_login_count = $2,
                    is_locked          = $3,
                    updated_at         = NOW()
                WHERE id = $1
                """,
                user_id,
                new_count,
                locked,
            )
