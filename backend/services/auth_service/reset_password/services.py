import hashlib
import logging
from datetime import datetime, timezone

from asyncpg import Pool

from utils.bcrypt_utils import hash_password

logger = logging.getLogger(__name__)


class ResetPasswordService:
    """Resets a user's password using a valid reset token."""

    def __init__(self, pool: Pool):
        self._pool = pool

    async def reset_password(self, raw_token: str, new_password: str) -> bool:
        """
        Validate the token, update the password, and clear the reset fields.
        Returns True on success, False if the token is invalid or expired.
        """
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        now = datetime.now(timezone.utc)

        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, reset_expires_at
                FROM users
                WHERE reset_token_hash = $1
                  AND is_verified = TRUE
                  AND is_active = TRUE
                """,
                token_hash,
            )

            if row is None or row["reset_expires_at"] is None:
                return False

            if now >= row["reset_expires_at"]:
                return False

            pw_hash = hash_password(new_password)

            await conn.execute(
                """
                UPDATE users
                SET password_hash      = $1,
                    reset_token_hash   = NULL,
                    reset_expires_at   = NULL,
                    updated_at         = NOW()
                WHERE id = $2
                """,
                pw_hash,
                row["id"],
            )

        return True
