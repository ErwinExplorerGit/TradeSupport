import bcrypt

_ROUNDS = 12


def hash_password(plain_password: str) -> str:
    """
    Hash a plain-text password using bcrypt.

    Args:
        plain_password: The raw password string to hash.

    Returns:
        The bcrypt hash as a UTF-8 string, suitable for storing in the database.
    """
    salt = bcrypt.gensalt(rounds=_ROUNDS)
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against a stored bcrypt hash.

    Args:
        plain_password: The raw password string provided by the user.
        hashed_password: The bcrypt hash retrieved from the database.

    Returns:
        True if the password matches the hash, False otherwise.
    """
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )
