import re

_EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def is_valid_email(email: str) -> bool:
    """Return True if *email* matches the expected email format."""
    return bool(_EMAIL_PATTERN.match(email))
