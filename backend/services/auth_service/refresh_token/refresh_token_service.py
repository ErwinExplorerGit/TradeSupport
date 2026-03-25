import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone

from asyncpg import Pool
from fastapi import HTTPException

from utils.jwt_utils import create_access_token

logger = logging.getLogger(__name__)

_REFRESH_TOKEN_EXPIRY_DAYS = 7


class RefreshTokenService:
    """Issues a new access token (and rotates the refresh token) given a valid opaque refresh token."""

    def __init__(self, pool: Pool):
        self._pool = pool

    async def refresh(self, refresh_token: str) -> dict:
        """
        Validate the opaque refresh token from the HttpOnly cookie and issue a
        new access token + rotated refresh token.

        Raises HTTPException(401) on any validation failure.
        """
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()

        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT id, email, refresh_token_hash, refresh_expires_at, is_active, is_verified, is_locked
                FROM users
                WHERE refresh_token_hash = $1
                """,
                token_hash,
            )

        if row is None:
            logger.warning("No user found matching the provided refresh token hash")
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        if not row["is_active"]:
            logger.warning("Refresh attempt on deactivated account: %s", row["email"])
            raise HTTPException(status_code=403, detail="Account is deactivated")

        if not row["is_verified"]:
            logger.warning("Refresh attempt on unverified account: %s", row["email"])
            raise HTTPException(status_code=403, detail="Account email is not verified")

        if row["is_locked"]:
            logger.warning("Refresh attempt on locked account: %s", row["email"])
            raise HTTPException(status_code=403, detail="Account is locked")

        if row["refresh_expires_at"] < datetime.now(timezone.utc):
            logger.info("Refresh token expired for user: %s", row["email"])
            async with self._pool.acquire() as conn:
                await conn.execute(
                    """
                    UPDATE users
                    SET refresh_token_hash = NULL,
                        refresh_expires_at = NULL,
                        updated_at = NOW()
                    WHERE id = $1
                    """,
                    row["id"],
                )
            raise HTTPException(status_code=401, detail="Refresh token has expired")

        # Issue new access token
        new_access_token = create_access_token({"sub": str(row["id"]), "email": row["email"]})

        # Rotate refresh token
        new_raw_refresh = secrets.token_hex(32)
        new_refresh_hash = hashlib.sha256(new_raw_refresh.encode()).hexdigest()
        new_refresh_expires = datetime.now(timezone.utc) + timedelta(days=_REFRESH_TOKEN_EXPIRY_DAYS)

        async with self._pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE users
                SET refresh_token_hash = $2,
                    refresh_expires_at = $3,
                    updated_at = NOW()
                WHERE id = $1
                """,
                row["id"],
                new_refresh_hash,
                new_refresh_expires,
            )

        return {
            "access_token": new_access_token,
            "refresh_token": new_raw_refresh,
        }
