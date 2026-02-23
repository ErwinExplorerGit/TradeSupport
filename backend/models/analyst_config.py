from pydantic import BaseModel


class AnalystConfig(BaseModel):
    """Configuration for which analysts to run."""

    market: bool = True
    social: bool = True
    news: bool = False
    fundamentals: bool = False
    momentum: bool = False
