import logging

from pydantic import BaseModel


logger = logging.getLogger(__name__)


class RefreshTokenResponse(BaseModel):
    access_token: str
