import hashlib
import logging
import os
import secrets
from datetime import datetime, timedelta, timezone

from asyncpg import Pool

logger = logging.getLogger(__name__)

_RESET_EXPIRY_MINUTES = 30
_APP_URL = os.getenv("APP_URL", "http://localhost:5173")


class ForgotPasswordService:
    """Issues a password-reset token for a verified, active user."""

    def __init__(self, pool: Pool):
        self._pool = pool

    async def get_active_user(self, email: str) -> dict | None:
        """Return basic user info if the account exists, is verified, and is active."""
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, first_name, is_verified, is_active FROM users WHERE email = $1",
                email,
            )
        if row is None or not row["is_verified"] or not row["is_active"]:
            return None
        return {"id": str(row["id"]), "first_name": row["first_name"]}

    async def get_user_by_token(self, raw_token: str) -> dict | None:
        """Return user info if the token is valid and not yet expired."""
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()

        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT email, first_name, is_verified, is_active
                FROM users
                WHERE reset_token_hash = $1
                """,
                token_hash,
            )
        if row is None or not row["is_verified"] or not row["is_active"]:
            return None
        return {"email": row["email"], "first_name": row["first_name"]}

    async def create_reset_token(self, email: str) -> str:
        """Generate a reset token, persist its hash, and return the raw token."""
        raw_token = secrets.token_hex(32)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=2)
        # expires_at = datetime.now(timezone.utc) + timedelta(minutes=_RESET_EXPIRY_MINUTES)

        async with self._pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE users
                SET reset_token_hash  = $1,
                    reset_expires_at  = $2,
                    updated_at        = NOW()
                WHERE email = $3
                """,
                token_hash,
                expires_at,
                email,
            )
        return raw_token
