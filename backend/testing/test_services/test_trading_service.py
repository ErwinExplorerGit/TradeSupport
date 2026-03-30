"""
Unit tests for services/trading_service/service.py

Covers TradingService:
- ProviderURL.get_url returns correct URLs for known providers (case-insensitive)
- ProviderURL.get_url raises ValueError for unknown providers
- TradingService initialises in mock mode when the tradingagents package is absent
- TradingService.is_real_mode reflects the inverse of mock_mode
- TradingService._estimate_progress helper maps known keywords to progress %

No external I/O or LLM calls are made; tradingagents import is patched out.
"""

import sys
from unittest.mock import patch

import pytest

from services.trading_service.service import TradingService, ProviderURL
from services.trading_service.routes import _estimate_progress


@pytest.mark.unit
class TestProviderURL:
    @pytest.mark.parametrize(
        "provider, expected_fragment",
        [
            ("openai", "openai.com"),
            ("OPENAI", "openai.com"),
            ("anthropic", "anthropic.com"),
            ("GOOGLE", "googleapis.com"),
            ("openrouter", "openrouter.ai"),
            ("ollama", "localhost"),
        ],
    )
    def test_get_url_returns_correct_url(self, provider, expected_fragment):
        url = ProviderURL.get_url(provider)
        assert expected_fragment in url

    def test_get_url_case_insensitive(self):
        assert ProviderURL.get_url("openai") == ProviderURL.get_url("OPENAI")

    def test_get_url_unknown_provider_raises(self):
        with pytest.raises(ValueError, match="Unknown provider"):
            ProviderURL.get_url("nonexistent_provider")


@pytest.mark.unit
class TestTradingServiceInit:
    def test_mock_mode_when_tradingagents_unavailable(self):
        """If tradingagents cannot be imported, the service falls back to mock mode."""
        with patch.object(TradingService, "_check_trading_agent_availability", return_value=False):
            svc = TradingService()
        assert svc.mock_mode is True

    def test_real_mode_when_tradingagents_available(self):
        with patch.object(TradingService, "_check_trading_agent_availability", return_value=True):
            svc = TradingService()
        assert svc.mock_mode is False

    def test_is_real_mode_inverse_of_mock_mode(self):
        with patch.object(TradingService, "_check_trading_agent_availability", return_value=False):
            svc = TradingService()
        assert svc.is_real_mode is False

        with patch.object(TradingService, "_check_trading_agent_availability", return_value=True):
            svc2 = TradingService()
        assert svc2.is_real_mode is True


@pytest.mark.unit
class TestEstimateProgress:
    @pytest.mark.parametrize(
        "message, expected_pct",
        [
            ("MOCK MODE: Analyzing TSLA", 5),
            ("REAL MODE: Analyzing NVDA", 5),
            ("Configuration built successfully", 10),
            ("Creating trading graph for TSLA...", 12),
            ("Running Market Analyst...", 14),
            ("Market Analyst completed", 18),
            ("Running Social Analyst...", 20),
            ("Running News Analyst", 26),
            ("Running Fundamentals Analyst", 32),
            ("Running Momentum strategy", 39),
            ("FINAL TRADING DECISION", 64),  # "Trading Decision" keyword matches first
            ("Analysis completed successfully", 100),
        ],
    )
    def test_known_keyword_returns_percentage(self, message, expected_pct):
        assert _estimate_progress(message) == expected_pct

    def test_unknown_message_returns_none(self):
        assert _estimate_progress("some unrelated log message") is None

    def test_case_insensitive_matching(self):
        assert _estimate_progress("mock mode: analyzing AAPL") == 5
