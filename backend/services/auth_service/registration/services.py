import logging

from asyncpg import Pool

from utils.bcrypt_utils import hash_password

logger = logging.getLogger(__name__)


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
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                INSERT INTO users (first_name, last_name, email, password_hash)
                VALUES ($1, $2, $3, $4)
                RETURNING id
                """,
                first_name,
                last_name,
                email,
                pw_hash,
            )
            return str(row["id"])
