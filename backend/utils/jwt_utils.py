import os
from datetime import datetime, timedelta, timezone

import jwt

_SECRET = os.getenv("JWT_SECRET_KEY")
_ALGORITHM = "HS256"
_ACCESS_TOKEN_EXPIRE_MINUTES = 15


def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=_ACCESS_TOKEN_EXPIRE_MINUTES)
    # payload["exp"] = datetime.now(timezone.utc) + timedelta(seconds=1)
    return jwt.encode(payload, _SECRET, algorithm=_ALGORITHM)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, _SECRET, algorithms=[_ALGORITHM])
