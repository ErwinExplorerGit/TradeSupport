import logging

from utils.bcrypt_utils import verify_password

logger = logging.getLogger(__name__)


class LoginService:
    """Handles authentication against the shared in-memory user store."""

    def __init__(self, users: dict[str, str]):
        self._users = users

    def authenticate(self, username: str, plain_password: str) -> bool:
        hashed = self._users.get(username)
        if hashed is None:
            return False
        return verify_password(plain_password, hashed)
