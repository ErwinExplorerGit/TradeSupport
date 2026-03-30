"""
Unit tests for utils/jwt_utils.py

Covers:
- create_access_token returns a non-empty string
- decode_access_token round-trips the payload correctly
- decode_access_token raises ExpiredSignatureError for an expired token
- decode_access_token raises DecodeError / InvalidTokenError for a tampered token
"""

import time
from datetime import datetime, timedelta, timezone

import jwt
import pytest

from utils.jwt_utils import create_access_token, decode_access_token

_SECRET = "test-secret-key-for-unit-tests-only"
_ALGORITHM = "HS256"


@pytest.mark.unit
class TestCreateAccessToken:
    def test_returns_non_empty_string(self, sample_jwt_payload):
        token = create_access_token(sample_jwt_payload)
        assert isinstance(token, str)
        assert len(token) > 0

    def test_token_has_three_segments(self, sample_jwt_payload):
        """A valid JWT always consists of three base64url segments separated by '.'."""
        token = create_access_token(sample_jwt_payload)
        assert token.count(".") == 2

    def test_does_not_mutate_input(self, sample_jwt_payload):
        original = dict(sample_jwt_payload)
        create_access_token(sample_jwt_payload)
        assert sample_jwt_payload == original


@pytest.mark.unit
class TestDecodeAccessToken:
    def test_round_trips_sub_and_email(self, sample_jwt_payload):
        token = create_access_token(sample_jwt_payload)
        decoded = decode_access_token(token)
        assert decoded["sub"] == sample_jwt_payload["sub"]
        assert decoded["email"] == sample_jwt_payload["email"]

    def test_contains_exp_claim(self, sample_jwt_payload):
        token = create_access_token(sample_jwt_payload)
        decoded = decode_access_token(token)
        assert "exp" in decoded

    def test_raises_on_expired_token(self):
        """A token whose 'exp' is in the past must raise ExpiredSignatureError."""
        expired_payload = {
            "sub": "user-1",
            "exp": datetime.now(timezone.utc) - timedelta(seconds=1),
        }
        expired_token = jwt.encode(expired_payload, _SECRET, algorithm=_ALGORITHM)
        with pytest.raises(jwt.ExpiredSignatureError):
            decode_access_token(expired_token)

    def test_raises_on_tampered_token(self, sample_jwt_payload):
        """Altering any part of the token must raise an InvalidTokenError."""
        token = create_access_token(sample_jwt_payload)
        tampered = token[:-5] + "XXXXX"
        with pytest.raises(jwt.exceptions.PyJWTError):
            decode_access_token(tampered)

    def test_raises_on_wrong_secret(self, sample_jwt_payload):
        """A token signed with a different secret must be rejected."""
        # Use a 32+ byte secret to avoid InsecureKeyLengthWarning while still being a wrong key
        token_wrong_secret = jwt.encode(
            sample_jwt_payload,
            "totally-different-secret-key-long-enough",
            algorithm=_ALGORITHM,
        )
        with pytest.raises(jwt.exceptions.PyJWTError):
            decode_access_token(token_wrong_secret)

    def test_raises_on_garbage_string(self):
        with pytest.raises(jwt.exceptions.PyJWTError):
            decode_access_token("this.is.not.a.valid.jwt")
