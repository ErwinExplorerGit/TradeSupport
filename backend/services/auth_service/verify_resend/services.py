import hashlib
import logging
import os
import secrets
from datetime import datetime, timedelta, timezone

from asyncpg import Pool

logger = logging.getLogger(__name__)

_VERIFY_EXPIRY_HOURS = 24
_APP_URL = os.getenv("APP_URL", "http://localhost:5173")


class VerifyResendService:
    """Regenerates a verification token for an unverified user."""

    def __init__(self, pool: Pool):
        self._pool = pool

    async def get_unverified_user(self, email: str) -> dict | None:
        """Return basic user info if the user exists and is not yet verified, else None."""
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, first_name, is_verified FROM users WHERE email = $1",
                email,
            )
        if row is None or row["is_verified"]:
            return None
        return {"id": str(row["id"]), "first_name": row["first_name"]}

    async def refresh_verification_token(self, email: str) -> str:
        """Generate a new verification token, persist its hash, and return the raw token."""
        raw_token = secrets.token_hex(32)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        expires_at = datetime.now(timezone.utc) + timedelta(hours=_VERIFY_EXPIRY_HOURS)

        async with self._pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE users
                SET verification_token_hash = $1,
                    verification_expires_at = $2,
                    updated_at = NOW()
                WHERE email = $3
                """,
                token_hash,
                expires_at,
                email,
            )
        return raw_token
