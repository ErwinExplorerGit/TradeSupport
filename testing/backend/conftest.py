"""
Root conftest.py — shared fixtures available to every test module.

Adds the backend directory to sys.path so that backend packages
(utils, models, services, middleware, config) are importable without
installing anything.
"""

import os
import sys
from pathlib import Path

import pytest

# ── Path bootstrap ─────────────────────────────────────────────────────────────
# Insert the backend directory at the front of sys.path so every test can
# import backend modules directly (e.g. `from utils.bcrypt_utils import …`).
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# ── Environment defaults ───────────────────────────────────────────────────────
# Set minimal env variables required by backend modules at import time so that
# tests do not need a real .env file.
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-unit-tests-only")
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/testdb")
# SMTP — required by config/smtp/__init__.py which is imported at module level
os.environ.setdefault("SMTP_HOST", "smtp.example.com")
os.environ.setdefault("SMTP_PORT", "587")
os.environ.setdefault("SMTP_USERNAME", "test@example.com")
os.environ.setdefault("SMTP_PASSWORD", "testpassword")
os.environ.setdefault("SMTP_FROM_EMAIL", "noreply@example.com")
os.environ.setdefault("SMTP_FROM_NAME", "TradeSupport Test")


# ── Fixtures ───────────────────────────────────────────────────────────────────


@pytest.fixture
def sample_jwt_payload() -> dict:
    """A minimal JWT payload used by JWT-related tests."""
    return {"sub": "user-uuid-1234", "email": "test@example.com"}


@pytest.fixture
def mock_db_pool(mocker):
    """
    A MagicMock that mimics an asyncpg connection pool.

    Provides an async context manager via `pool.acquire()` that returns
    a mock connection with an awaitable `fetchrow` / `fetch` / `execute`.
    """
    pool = mocker.MagicMock()
    conn = mocker.AsyncMock()
    pool.acquire.return_value.__aenter__ = mocker.AsyncMock(return_value=conn)
    pool.acquire.return_value.__aexit__ = mocker.AsyncMock(return_value=False)
    return pool, conn
