"""
Unit tests for utils/email_utils.py

Covers:
- Valid e-mail addresses are accepted
- Strings missing the '@' are rejected
- Strings missing the local-part are rejected
- Strings missing the domain are rejected
- Strings missing the TLD are rejected
- Addresses with spaces are rejected
- Empty string is rejected
"""

import pytest

from utils.email_utils import is_valid_email


@pytest.mark.unit
class TestIsValidEmail:
    # ── Valid cases ────────────────────────────────────────────────────────────
    @pytest.mark.parametrize(
        "email",
        [
            "user@example.com",
            "user.name+tag@sub.domain.org",
            "USER@EXAMPLE.COM",
            "u@e.io",
            "first.last@company.co.uk",
        ],
    )
    def test_valid_emails(self, email):
        assert is_valid_email(email) is True

    # ── Invalid cases ──────────────────────────────────────────────────────────
    @pytest.mark.parametrize(
        "email",
        [
            "plainaddress",  # no @
            "@missinglocalpart.com",  # no local part
            "missing@",  # no domain
            "missing.domain@",  # no domain
            "spaces in@email.com",  # space in local part
            "user@domain with space.com",  # space in domain
            "",  # empty string
            "user@@double.com",  # double @
        ],
    )
    def test_invalid_emails(self, email):
        assert is_valid_email(email) is False
