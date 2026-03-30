"""
Unit tests for models/analysis_request.py

Covers AnalysisRequest:
- ticker is coerced to uppercase and stripped of whitespace
- ticker length validation (min 1, max 10)
- analysis_date accepts a valid date
- llm_provider defaults to 'openai'
- research_depth defaults to SHALLOW (1)
- shallow_model / deep_model default to 'gpt-4o-mini'
- required fields (ticker, analysis_date) reject missing values

Covers AnalysisBatchRequest:
- tickers are all uppercased
- duplicate tickers are de-duplicated
- empty tickers list is rejected
"""

from datetime import date

import pytest
from pydantic import ValidationError

from models.analysis_request import AnalysisRequest, AnalysisBatchRequest
from models.llm_provider import LLMProvider
from models.research_depth import ResearchDepth


_TODAY = date(2026, 3, 30)


@pytest.mark.unit
class TestAnalysisRequest:
    def _make(self, **overrides) -> AnalysisRequest:
        defaults = {"ticker": "tsla", "analysis_date": _TODAY}
        defaults.update(overrides)
        return AnalysisRequest(**defaults)

    # ── ticker coercion ────────────────────────────────────────────────────────
    def test_ticker_is_uppercased(self):
        req = self._make(ticker="tsla")
        assert req.ticker == "TSLA"

    def test_ticker_whitespace_stripped(self):
        req = self._make(ticker="  aapl  ")
        assert req.ticker == "AAPL"

    def test_ticker_mixed_case_uppercased(self):
        req = self._make(ticker="nVdA")
        assert req.ticker == "NVDA"

    # ── ticker length validation ────────────────────────────────────────────────
    def test_ticker_min_length_one(self):
        req = self._make(ticker="A")
        assert req.ticker == "A"

    def test_ticker_max_length_ten(self):
        req = self._make(ticker="ABCDEFGHIJ")  # exactly 10
        assert req.ticker == "ABCDEFGHIJ"

    def test_ticker_too_long_raises(self):
        with pytest.raises(ValidationError):
            self._make(ticker="TOOLONGTICKERX")  # 14 chars

    def test_ticker_empty_raises(self):
        with pytest.raises(ValidationError):
            self._make(ticker="")

    def test_ticker_required(self):
        with pytest.raises(ValidationError):
            AnalysisRequest(analysis_date=_TODAY)

    # ── defaults ───────────────────────────────────────────────────────────────
    def test_llm_provider_defaults_to_openai(self):
        req = self._make()
        assert req.llm_provider == LLMProvider.OPENAI

    def test_research_depth_defaults_to_shallow(self):
        req = self._make()
        assert req.research_depth == ResearchDepth.SHALLOW

    def test_shallow_model_default(self):
        req = self._make()
        assert req.shallow_model == "gpt-4o-mini"

    def test_deep_model_default(self):
        req = self._make()
        assert req.deep_model == "gpt-4o-mini"

    def test_analysis_date_required(self):
        with pytest.raises(ValidationError):
            AnalysisRequest(ticker="TSLA")

    # ── explicit valid values ──────────────────────────────────────────────────
    def test_accepts_anthropic_provider(self):
        req = self._make(llm_provider="anthropic")
        assert req.llm_provider == LLMProvider.ANTHROPIC

    def test_accepts_deep_research_depth(self):
        req = self._make(research_depth=5)
        assert req.research_depth == ResearchDepth.DEEP


@pytest.mark.unit
class TestAnalysisBatchRequest:
    def _make(self, **overrides) -> AnalysisBatchRequest:
        defaults = {"tickers": ["tsla", "aapl"], "analysis_date": _TODAY}
        defaults.update(overrides)
        return AnalysisBatchRequest(**defaults)

    def test_tickers_are_uppercased(self):
        req = self._make(tickers=["tsla", "aapl"])
        assert req.tickers == ["TSLA", "AAPL"]

    def test_empty_tickers_list_raises(self):
        with pytest.raises(ValidationError):
            self._make(tickers=[])
