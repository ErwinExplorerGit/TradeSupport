import hashlib
import logging
import os
import secrets
from datetime import datetime, timedelta, timezone

from asyncpg import Pool

from utils.bcrypt_utils import hash_password

logger = logging.getLogger(__name__)

_VERIFY_EXPIRY_HOURS = 24
_VERIFY_EXPIRY_SECONDS_TEST = 2  # for testing only
_APP_URL = os.getenv("APP_URL", "http://localhost:5173")


class RegistrationService:
    """Handles user registration against the PostgreSQL database."""

    def __init__(self, pool: Pool):
        self._pool = pool

    async def user_exists(self, email: str) -> bool:
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id FROM users WHERE email = $1",
                email,
            )
            return row is not None

    async def register_user(
        self,
        first_name: str,
        last_name: str,
        email: str,
        plain_password: str,
    ) -> str:
        """Insert a new user record and return the generated UUID."""
        pw_hash = hash_password(plain_password)
        raw_token = secrets.token_hex(32)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        expires_at = datetime.now(timezone.utc) + timedelta(hours=_VERIFY_EXPIRY_HOURS)
        # expires_at = datetime.now(timezone.utc) + timedelta(seconds=_VERIFY_EXPIRY_SECONDS_TEST)  # testing

        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                INSERT INTO users (first_name, last_name, email, password_hash,
                                   verification_token_hash, verification_expires_at)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
                """,
                first_name,
                last_name,
                email,
                pw_hash,
                token_hash,
                expires_at,
            )
        return str(row["id"]), raw_token
