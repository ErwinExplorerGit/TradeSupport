import json
import logging

import jwt
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from utils.jwt_utils import decode_access_token

logger = logging.getLogger(__name__)

# Routes that do not require authentication.
# Prefix matching is used — any path that starts with one of these strings
# is considered public.
PUBLIC_ROUTE_PREFIXES: tuple[str, ...] = (
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/resend-verify-email",
    "/api/auth/verify-email",
    "/api/auth/forgot-password",
    "/api/auth/verify-reset-password-token",
    "/api/auth/reset-password",
    "/api/auth/refresh",
    # WebSocket — authenticates itself via ?token= query param
    "/ws",
    # Documentation routes (if enabled)
    "/docs",
    "/openapi.json",
    "/redoc",
)


def _is_public_route(path: str) -> bool:
    return any(path.startswith(prefix) for prefix in PUBLIC_ROUTE_PREFIXES)


def _json_response(status_code: int, detail: str) -> Response:
    return Response(
        content=json.dumps({"detail": detail}),
        status_code=status_code,
        media_type="application/json",
    )


class Middleware(BaseHTTPMiddleware):
    """Middleware that protects private routes with Bearer token authentication.

    For every request whose path does not match a PUBLIC_ROUTE_PREFIXES entry
    the middleware verifies that:
      1. An ``Authorization`` header is present.
      2. The value follows the ``Bearer <token>`` scheme.
      3. The token is a valid, non-expired JWT signed with the application
         secret (validated via :func:`utils.jwt_utils.decode_access_token`).

    If any check fails a ``401 Unauthorized`` JSON response is returned
    immediately and the request is *not* forwarded to the route handler.

    On success the decoded JWT payload is attached to ``request.state.user``
    so downstream handlers can access it without re-decoding the token.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        print(f"Incoming request: {request.method} {request.url.path}")

        if request.method == "OPTIONS":
            # Handle CORS preflight requests without authentication
            return await call_next(request)

        if _is_public_route(request.url.path):
            return await call_next(request)

        print("+" * 50)

        auth_header: str | None = request.headers.get("Authorization")

        # Check if the Authorization header is present
        if not auth_header:
            return _json_response(401, "Missing Authorization header")

        # Split the header into "Bearer" and the token
        parts = auth_header.split()

        # Validate the format of the Authorization header
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return _json_response(
                401,
                "Invalid Authorization header format. Expected 'Bearer <token>'",
            )
        # Extract the token part
        token = parts[1]

        try:
            # Decode and validate the token
            payload = decode_access_token(token)

            request.state.user = payload

        except jwt.ExpiredSignatureError:
            logger.warning("Rejected request to %s: token expired", request.url.path)
            return _json_response(401, "Token has expired")
        except jwt.InvalidTokenError as exc:
            logger.warning(
                "Rejected request to %s: invalid token (%s)",
                request.url.path,
                exc,
            )
            return _json_response(401, "Invalid token")

        return await call_next(request)
