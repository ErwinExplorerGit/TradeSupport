import hashlib
import logging
from datetime import datetime, timezone

from asyncpg import Pool

logger = logging.getLogger(__name__)


class VerifyPasswordResetService:
    """Checks whether a password-reset token is still valid."""

    def __init__(self, pool: Pool):
        self._pool = pool

    async def validate_token(self, raw_token: str) -> bool:
        """Return True if the token exists and has not expired."""
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()

        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT reset_expires_at FROM users WHERE reset_token_hash = $1",
                token_hash,
            )

        if row is None or row["reset_expires_at"] is None:
            return False

        return datetime.now(timezone.utc) < row["reset_expires_at"]
