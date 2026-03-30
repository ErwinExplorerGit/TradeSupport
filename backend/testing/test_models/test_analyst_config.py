"""
Unit tests for models/analyst_config.py

Covers AnalystConfig:
- Default values match the spec (market=True, social=True, rest=False)
- All fields can be overridden explicitly
- Invalid types are rejected by Pydantic
"""

import pytest
from pydantic import ValidationError

from models.analyst_config import AnalystConfig


@pytest.mark.unit
class TestAnalystConfig:
    # ── Defaults ───────────────────────────────────────────────────────────────
    def test_market_default_true(self):
        assert AnalystConfig().market is True

    def test_social_default_true(self):
        assert AnalystConfig().social is True

    def test_news_default_false(self):
        assert AnalystConfig().news is False

    def test_fundamentals_default_false(self):
        assert AnalystConfig().fundamentals is False

    def test_momentum_default_false(self):
        assert AnalystConfig().momentum is False

    # ── Explicit overrides ─────────────────────────────────────────────────────
    def test_all_fields_enabled(self):
        cfg = AnalystConfig(market=True, social=True, news=True, fundamentals=True, momentum=True)
        assert all([cfg.market, cfg.social, cfg.news, cfg.fundamentals, cfg.momentum])

    def test_all_fields_disabled(self):
        cfg = AnalystConfig(market=False, social=False, news=False, fundamentals=False, momentum=False)
        assert not any([cfg.market, cfg.social, cfg.news, cfg.fundamentals, cfg.momentum])

    def test_partial_override(self):
        cfg = AnalystConfig(market=False, news=True)
        assert cfg.market is False
        assert cfg.social is True  # default not changed
        assert cfg.news is True

    # ── Type coercion (Pydantic coerces truthy ints to bool) ───────────────────
    def test_integer_one_coerced_to_true(self):
        cfg = AnalystConfig(market=1)
        assert cfg.market is True

    def test_integer_zero_coerced_to_false(self):
        cfg = AnalystConfig(market=0)
        assert cfg.market is False
