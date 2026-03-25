import logging

from asyncpg import Pool
from fastapi import HTTPException

from utils.bcrypt_utils import hash_password, verify_password

logger = logging.getLogger(__name__)


class ChangePasswordService:
    """Allows an authenticated user to change their own password."""

    def __init__(self, pool: Pool):
        self._pool = pool

    async def change_password(self, user_id: str, current_password: str, new_password: str) -> None:
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT password_hash
                FROM users
                WHERE id = $1
                  AND is_active = TRUE
                  AND is_verified = TRUE
                """,
                user_id,
            )

        if row is None:
            raise HTTPException(status_code=404, detail="User not found")

        if not verify_password(current_password, row["password_hash"]):
            raise HTTPException(status_code=400, detail="Current password is incorrect")

        new_hash = hash_password(new_password)

        async with self._pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE users
                SET password_hash = $1,
                    updated_at    = NOW()
                WHERE id = $2
                """,
                new_hash,
                user_id,
            )

        logger.info("Password changed for user %s", user_id)
