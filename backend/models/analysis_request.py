from pydantic import BaseModel, Field, field_validator
from datetime import date
from typing import List

from .llm_provider import LLMProvider
from .research_depth import ResearchDepth
from .analyst_config import AnalystConfig
from .analyst_config import AnalystConfig


class AnalysisRequest(BaseModel):
    """Request model for starting an analysis on a single ticker."""

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
                "research_depth": 1,
                "llm_provider": "openai",
                "shallow_model": "gpt-4o-mini",
                "deep_model": "gpt-4o-mini",
            },
        }


class AnalysisBatchRequest(BaseModel):
    """Request model for starting an analysis on multiple tickers simultaneously."""

    tickers: List[str] = Field(..., min_length=1, description="List of stock ticker symbols")
    analysis_date: date = Field(..., description="Date for analysis")
    analysts: AnalystConfig = Field(default_factory=AnalystConfig)
    research_depth: ResearchDepth = Field(default=ResearchDepth.SHALLOW)
    llm_provider: LLMProvider = Field(default=LLMProvider.OPENAI)
    shallow_model: str = Field(default="gpt-4o-mini")
    deep_model: str = Field(default="gpt-4o-mini")

    @field_validator("tickers")
    @classmethod
    def tickers_uppercase(cls, v: List[str]) -> List[str]:
        """Convert all tickers to uppercase and remove duplicates."""
        seen: set[str] = set()
        result: list[str] = []
        for t in v:
            upper = t.upper().strip()
            if upper and upper not in seen:
                seen.add(upper)
                result.append(upper)
        if not result:
            raise ValueError("At least one ticker is required")
        return result

    def to_single_requests(self) -> list[AnalysisRequest]:
        """Expand into one AnalysisRequest per ticker."""
        return [
            AnalysisRequest(
                ticker=t,
                analysis_date=self.analysis_date,
                analysts=self.analysts,
                research_depth=self.research_depth,
                llm_provider=self.llm_provider,
                shallow_model=self.shallow_model,
                deep_model=self.deep_model,
            )
            for t in self.tickers
        ]
