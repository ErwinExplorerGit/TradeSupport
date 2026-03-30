"""
Unit tests for utils/bcrypt_utils.py

Covers:
- hash_password returns a string that is NOT the original plaintext
- hash_password produces a valid bcrypt hash (starts with $2b$)
- Two hashes of the same password are different (unique salts)
- verify_password returns True for a matching password
- verify_password returns False for an incorrect password
- verify_password is case-sensitive
"""

import pytest

from utils.bcrypt_utils import hash_password, verify_password


@pytest.mark.unit
class TestHashPassword:
    def test_returns_string(self):
        result = hash_password("mysecretpassword")
        assert isinstance(result, str)

    def test_is_not_plaintext(self):
        plain = "mysecretpassword"
        assert hash_password(plain) != plain

    def test_has_bcrypt_prefix(self):
        """bcrypt hashes start with $2b$ (or $2a$ on some platforms)."""
        result = hash_password("somepassword")
        assert result.startswith(("$2b$", "$2a$"))

    def test_unique_hashes_per_call(self):
        """Each call should produce a different salt → different hash."""
        h1 = hash_password("samepassword")
        h2 = hash_password("samepassword")
        assert h1 != h2

    def test_empty_password_hashes(self):
        """An empty string is a valid input; bcrypt should handle it."""
        result = hash_password("")
        assert isinstance(result, str)
        assert result.startswith(("$2b$", "$2a$"))


@pytest.mark.unit
class TestVerifyPassword:
    def test_correct_password_returns_true(self):
        plain = "correct_horse_battery_staple"
        hashed = hash_password(plain)
        assert verify_password(plain, hashed) is True

    def test_wrong_password_returns_false(self):
        hashed = hash_password("correct_password")
        assert verify_password("wrong_password", hashed) is False

    def test_case_sensitive(self):
        hashed = hash_password("Password123")
        assert verify_password("password123", hashed) is False

    def test_empty_password_matches_empty_hash(self):
        hashed = hash_password("")
        assert verify_password("", hashed) is True
        assert verify_password("notempty", hashed) is False
