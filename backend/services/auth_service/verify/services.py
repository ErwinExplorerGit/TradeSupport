import hashlib
import logging
from datetime import datetime, timezone

from asyncpg import Pool
from fastapi import HTTPException

logger = logging.getLogger(__name__)


class VerifyService:
    """Verifies a user account using a raw verification token."""

    def __init__(self, pool: Pool):
        self._pool = pool

    async def verify_token(self, raw_token: str) -> bool:
        """
        Hash the raw token, check it exists, then verify it has not expired and
        the account is not already verified before marking the user as verified.

        Raises HTTPException 400 for expired or already-verified tokens.
        Returns True if the account was successfully verified.
        """
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()

        print(f"Verifying token: {raw_token} (hash: {token_hash})")  # Debug log

        now = datetime.now(timezone.utc)

        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT is_verified, verification_expires_at
                FROM users
                WHERE verification_token_hash = $1
                """,
                token_hash,
            )

            if row is None:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid verification token",
                )

            if row["is_verified"]:
                raise HTTPException(
                    status_code=400,
                    detail="Account is already verified",
                )

            if row["verification_expires_at"] <= now:
                raise HTTPException(
                    status_code=400,
                    detail="Verification token has expired",
                )

            await conn.execute(
                """
                UPDATE users
                SET is_verified              = TRUE,
                    verification_token_hash  = NULL,
                    verification_expires_at  = NULL,
                    updated_at               = NOW()
                WHERE verification_token_hash = $1
                """,
                token_hash,
            )

        return True
