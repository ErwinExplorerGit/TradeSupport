import hashlib
import logging
from datetime import datetime, timezone

from asyncpg import Pool

logger = logging.getLogger(__name__)


class VerifyService:
    """Verifies a user account using a raw verification token."""

    def __init__(self, pool: Pool):
        self._pool = pool

    async def verify_token(self, raw_token: str) -> bool:
        """
        Hash the raw token, find a matching unverified user whose token has not
        expired, mark them as verified, and clear the token fields.

        Returns True if a row was updated, False otherwise.
        """
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        now = datetime.now(timezone.utc)

        async with self._pool.acquire() as conn:
            result = await conn.execute(
                """
                UPDATE users
                SET is_verified              = TRUE,
                    verification_token_hash  = NULL,
                    verification_expires_at  = NULL,
                    updated_at               = NOW()
                WHERE verification_token_hash = $1
                  AND verification_expires_at  > $2
                  AND is_verified              = FALSE
                """,
                token_hash,
                now,
            )

        return result
