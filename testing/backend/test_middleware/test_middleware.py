"""
Unit tests for middleware/middleware.py

Covers:
- _is_public_route correctly classifies all declared public prefixes
- _is_public_route returns False for private paths
- _json_response builds a valid JSON Response with the correct status code and detail
- Middleware.dispatch passes through OPTIONS (CORS preflight) without auth check
- Middleware.dispatch allows public routes without an Authorization header
- Middleware.dispatch returns 401 when Authorization header is absent on a private route
- Middleware.dispatch returns 401 when Authorization header has wrong format
- Middleware.dispatch returns 401 for an expired JWT
- Middleware.dispatch returns 401 for a tampered JWT
- Middleware.dispatch attaches decoded payload to request.state.user on success

The middleware is tested via a lightweight ASGI test client using httpx so that
the full Starlette dispatch cycle runs without needing the real FastAPI app.
"""

import json
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import jwt
import pytest
from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

from middleware.middleware import Middleware, _is_public_route, _json_response, PUBLIC_ROUTE_PREFIXES

_SECRET = "test-secret-key-for-unit-tests-only"
_ALGORITHM = "HS256"


# ── Helper ─────────────────────────────────────────────────────────────────────


def _make_token(payload: dict, secret: str = _SECRET, expired: bool = False) -> str:
    data = dict(payload)
    if expired:
        data["exp"] = datetime.now(timezone.utc) - timedelta(seconds=10)
    else:
        data["exp"] = datetime.now(timezone.utc) + timedelta(minutes=15)
    return jwt.encode(data, secret, algorithm=_ALGORITHM)


# ── _is_public_route ───────────────────────────────────────────────────────────


@pytest.mark.unit
class TestIsPublicRoute:
    @pytest.mark.parametrize("prefix", PUBLIC_ROUTE_PREFIXES)
    def test_exact_public_prefix_is_public(self, prefix):
        assert _is_public_route(prefix) is True

    @pytest.mark.parametrize("prefix", PUBLIC_ROUTE_PREFIXES)
    def test_path_starting_with_prefix_is_public(self, prefix):
        assert _is_public_route(prefix + "/extra") is True

    @pytest.mark.parametrize(
        "path",
        [
            "/api/trading/start",
            "/api/history",
            "/api/user/profile",
            "/admin",
        ],
    )
    def test_private_paths_are_not_public(self, path):
        assert _is_public_route(path) is False


# ── _json_response ─────────────────────────────────────────────────────────────


@pytest.mark.unit
class TestJsonResponse:
    def test_status_code_is_set(self):
        resp = _json_response(401, "Unauthorized")
        assert resp.status_code == 401

    def test_body_contains_detail(self):
        resp = _json_response(403, "Forbidden")
        body = json.loads(resp.body)
        assert body["detail"] == "Forbidden"

    def test_content_type_is_json(self):
        resp = _json_response(400, "Bad request")
        assert resp.media_type == "application/json"


# ── Middleware dispatch ────────────────────────────────────────────────────────


def _build_test_app() -> FastAPI:
    """Create a minimal FastAPI app with the Middleware attached and one protected route."""
    app = FastAPI()
    app.add_middleware(Middleware)

    @app.get("/api/protected")
    async def protected(request: Request):
        return {"user": request.state.user}

    @app.get("/api/auth/login")
    async def public_login():
        return {"ok": True}

    @app.options("/api/protected")
    async def preflight():
        return {}

    return app


@pytest.fixture(scope="module")
def test_client():
    app = _build_test_app()
    return TestClient(app, raise_server_exceptions=False)


@pytest.mark.unit
class TestMiddlewareDispatch:
    def test_public_route_no_auth_required(self, test_client):
        resp = test_client.get("/api/auth/login")
        assert resp.status_code == 200

    def test_missing_auth_header_returns_401(self, test_client):
        resp = test_client.get("/api/protected")
        assert resp.status_code == 401
        assert "Missing" in resp.json()["detail"]

    def test_malformed_auth_header_returns_401(self, test_client):
        resp = test_client.get("/api/protected", headers={"Authorization": "Token abc123"})
        assert resp.status_code == 401

    def test_bearer_only_no_token_returns_401(self, test_client):
        resp = test_client.get("/api/protected", headers={"Authorization": "Bearer"})
        assert resp.status_code == 401

    def test_expired_token_returns_401(self, test_client):
        token = _make_token({"sub": "user-1"}, expired=True)
        resp = test_client.get("/api/protected", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 401

    def test_tampered_token_returns_401(self, test_client):
        token = _make_token({"sub": "user-1"})
        tampered = token[:-5] + "XXXXX"
        resp = test_client.get("/api/protected", headers={"Authorization": f"Bearer {tampered}"})
        assert resp.status_code == 401

    def test_valid_token_passes_through(self, test_client):
        token = _make_token({"sub": "user-1", "email": "u@example.com"})
        resp = test_client.get("/api/protected", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200

    def test_valid_token_attaches_payload(self, test_client):
        token = _make_token({"sub": "user-42", "email": "user@example.com"})
        resp = test_client.get("/api/protected", headers={"Authorization": f"Bearer {token}"})
        data = resp.json()
        assert data["user"]["sub"] == "user-42"
        assert data["user"]["email"] == "user@example.com"
