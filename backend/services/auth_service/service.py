import logging

logger = logging.getLogger(__name__)


class AuthService:
    """
    Simple authentication service with hardcoded credentials.

    This is a minimal implementation for demonstration purposes only.
    """

    def __init__(self):
        """Initialize the auth service with hardcoded credentials."""
        # Hardcoded credentials (for demo only - NOT production ready)
        self.credentials = {"admin": "admin123", "user": "user123", "demo": "demo123"}
        logger.info("Auth service initialized with hardcoded credentials")

    def authenticate(self, username: str, password: str) -> bool:
        """
        Authenticate user with username and password.

        Args:
            username: The username to authenticate
            password: The password to authenticate

        Returns:
            bool: True if authentication successful, False otherwise
        """
        if username in self.credentials:
            return self.credentials[username] == password
        return False
