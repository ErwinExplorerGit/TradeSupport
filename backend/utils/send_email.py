import logging
import re
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

import aiosmtplib

from config.smtp import smtp_config

logger = logging.getLogger(__name__)

_TEMPLATES_DIR = Path(__file__).parent.parent / "templates"


async def send_email(
    to: str,
    subject: str,
    template: str,
    context: dict,
) -> bool:
    """Send an HTML email rendered from *template* with *context* substitutions.

    Args:
        to:       Recipient email address.
        subject:  Email subject line.
        template: Template filename (relative to the templates/ directory),
                  e.g. ``"verify_account.html"``.
        context:  Mapping of placeholder names to values used to render the
                  template via ``str.format_map``.

    Returns:
        ``True`` if the message was accepted by the SMTP server, ``False``
        otherwise (e.g. SMTP not configured, connection error).
    """
    if not smtp_config.is_configured:
        logger.warning("send_email skipped — SMTP is not configured")
        return False

    template_path = _TEMPLATES_DIR / template
    try:
        raw = template_path.read_text(encoding="utf-8")
    except FileNotFoundError:
        logger.error("Email template not found: %s", template_path)
        return False

    def _replace(match: re.Match) -> str:
        key = match.group(1)
        if key not in context:
            logger.error("Missing template variable '%s' in context for template %s", key, template)
            return match.group(0)
        return str(context[key])

    html_body = re.sub(r"\{([A-Za-z_]\w*)\}", _replace, raw)

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{smtp_config.from_name} <{smtp_config.from_email}>"
    message["To"] = to
    message.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        await aiosmtplib.send(
            message,
            hostname=smtp_config.host,
            port=smtp_config.port,
            username=smtp_config.username,
            password=smtp_config.password,
            start_tls=True,
        )
        logger.info("Email sent to %s (subject: %s)", to, subject)
        return True
    except aiosmtplib.SMTPException as exc:
        logger.error("Failed to send email to %s: %s", to, exc)
        return False
