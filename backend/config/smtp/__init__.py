import logging
import os

logger = logging.getLogger(__name__)


class SMTPConfig:
    host: str = ""
    port: int = 587
    username: str = ""
    password: str = ""
    from_email: str = ""
    from_name: str = "TradeSupport"

    def __init__(self) -> None:
        self.host = os.getenv("SMTP_HOST")
        self.port = int(os.getenv("SMTP_PORT"))
        self.username = os.getenv("SMTP_USERNAME")
        self.password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("SMTP_FROM_EMAIL")
        self.from_name = os.getenv("SMTP_FROM_NAME")

    @property
    def is_configured(self) -> bool:
        return bool(self.host and self.username and self.password)


smtp_config = SMTPConfig()


def init_smtp() -> None:
    """Validate SMTP configuration at application startup and log its status."""
    if smtp_config.is_configured:
        logger.info(
            "SMTP ready — host=%s port=%d from=%s",
            smtp_config.host,
            smtp_config.port,
            smtp_config.from_email,
        )
    else:
        logger.warning("SMTP not configured — outbound email will be skipped")
