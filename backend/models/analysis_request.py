from pydantic import BaseModel, Field, field_validator
from datetime import date

from .llm_provider import LLMProvider
from .research_depth import ResearchDepth
from .analyst_config import AnalystConfig
from .analyst_config import AnalystConfig


class AnalysisRequest(BaseModel):
    """Request model for starting an analysis."""

    ticker: str = Field(..., min_length=1, max_length=10, description="Stock ticker symbol")
    analysis_date: date = Field(..., description="Date for analysis")
    analysts: AnalystConfig = Field(default_factory=AnalystConfig)
    research_depth: ResearchDepth = Field(default=ResearchDepth.SHALLOW)
    llm_provider: LLMProvider = Field(default=LLMProvider.OPENAI)
    shallow_model: str = Field(default="gpt-4o-mini")
    deep_model: str = Field(default="gpt-4o-mini")

    @field_validator("ticker")
    @classmethod
    def ticker_uppercase(cls, v: str) -> str:
        """Convert ticker to uppercase."""
        return v.upper().strip()

    class Config:
        json_schema_extra = {
            "example": {
                "ticker": "TSLA",
                "analysis_date": "2026-02-16",
                "analysts": {
                    "market": False,
                    "social": False,
                    "news": False,
                    "fundamentals": False,
                    "momentum": True,
                },
                "research_depth": 1,  # 1 for quick, 3 for standard, 5 for deep
                "llm_provider": "openai",
                "shallow_model": "gpt-4o-mini",
                "deep_model": "gpt-4o-mini",
            },
        }
