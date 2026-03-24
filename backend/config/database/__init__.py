import os
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import asyncpg
from asyncpg import Pool, Connection

logger = logging.getLogger(__name__)

_pool: Pool | None = None


def _dsn() -> str:
    host = os.environ["POSTGRES_HOST"]
    port = os.environ.get("POSTGRES_PORT")
    db = os.environ["POSTGRES_DB"]
    user = os.environ["POSTGRES_USER"]
    pwd = os.environ["POSTGRES_PASSWORD"]
    return f"postgresql://{user}:{pwd}@{host}:{port}/{db}"


async def init_db() -> None:
    """Create the connection pool. Call once at application startup."""
    global _pool
    if _pool is not None:
        return
    _pool = await asyncpg.create_pool(dsn=_dsn(), min_size=2, max_size=10)
    logger.info("Database connection pool created")


async def close_db() -> None:
    """Close the connection pool. Call once at application shutdown."""
    global _pool
    if _pool is None:
        return
    await _pool.close()
    _pool = None
    logger.info("Database connection pool closed")


def get_pool() -> Pool:
    """Return the active connection pool (must call init_db first)."""
    if _pool is None:
        raise RuntimeError("Database pool is not initialised. Call init_db() during startup.")
    return _pool


@asynccontextmanager
async def get_connection() -> AsyncGenerator[Connection, None]:
    """Async context manager that yields a single connection from the pool."""
    async with get_pool().acquire() as conn:
        yield conn
