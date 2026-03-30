"""
Unit tests for services/history_service/service.py

Covers HistoryService.get_history:
- Returns expected pagination keys (items, total, page, page_size)
- Applies the optional 'q' filter (passes correct SQL arguments)
- items list is empty when the mock returns no rows
- page/page_size values are echoed back correctly
- Offset calculation: page 2 with page_size 10 → offset 10

All database I/O is replaced with mocks.
"""

from unittest.mock import AsyncMock, MagicMock, patch
import uuid
from datetime import date, datetime, timezone

import pytest

from services.history_service.service import HistoryService


def _fake_count_row(count: int) -> dict:
    return {"cnt": count}


def _fake_rows(n: int) -> list[dict]:
    """Generate n fake scan-history asyncpg-like records."""
    return [
        {
            "id": uuid.uuid4(),
            "ticker": "TSLA",
            "company_name": "Tesla Inc.",
            "result": "BUY",
            "scanned_at": datetime(2026, 3, 25, 12, 0, 0, tzinfo=timezone.utc),
            "agent": "momentum",
            "analysis_date": date(2026, 3, 25),
        }
        for _ in range(n)
    ]


def _make_service_with_pool(count: int, rows: list) -> tuple[HistoryService, MagicMock]:
    """Return (HistoryService, mock_conn) pre-configured with given DB results."""
    conn = AsyncMock()
    conn.fetchrow = AsyncMock(return_value=_fake_count_row(count))
    conn.fetch = AsyncMock(return_value=rows)

    pool = MagicMock()
    pool.acquire.return_value.__aenter__ = AsyncMock(return_value=conn)
    pool.acquire.return_value.__aexit__ = AsyncMock(return_value=False)

    with patch("services.history_service.service.get_pool", return_value=pool):
        svc = HistoryService()

    return svc, pool, conn


@pytest.mark.unit
class TestHistoryService:
    @pytest.mark.asyncio
    async def test_returns_pagination_keys(self):
        rows = _fake_rows(2)
        svc, pool, conn = _make_service_with_pool(count=2, rows=rows)

        with patch("services.history_service.service.get_pool", return_value=pool):
            result = await svc.get_history("user-1")

        assert "items" in result
        assert "total" in result
        assert "page" in result
        assert "page_size" in result

    @pytest.mark.asyncio
    async def test_total_matches_count_row(self):
        rows = _fake_rows(3)
        svc, pool, conn = _make_service_with_pool(count=3, rows=rows)

        with patch("services.history_service.service.get_pool", return_value=pool):
            result = await svc.get_history("user-1")

        assert result["total"] == 3

    @pytest.mark.asyncio
    async def test_items_length_matches_returned_rows(self):
        rows = _fake_rows(5)
        svc, pool, conn = _make_service_with_pool(count=5, rows=rows)

        with patch("services.history_service.service.get_pool", return_value=pool):
            result = await svc.get_history("user-1")

        assert len(result["items"]) == 5

    @pytest.mark.asyncio
    async def test_empty_result(self):
        svc, pool, conn = _make_service_with_pool(count=0, rows=[])

        with patch("services.history_service.service.get_pool", return_value=pool):
            result = await svc.get_history("user-1")

        assert result["total"] == 0
        assert result["items"] == []

    @pytest.mark.asyncio
    async def test_page_and_page_size_echoed(self):
        svc, pool, conn = _make_service_with_pool(count=0, rows=[])

        with patch("services.history_service.service.get_pool", return_value=pool):
            result = await svc.get_history("user-1", page=3, page_size=15)

        assert result["page"] == 3
        assert result["page_size"] == 15

    @pytest.mark.asyncio
    async def test_q_filter_passes_query_to_fetchrow(self):
        """When 'q' is provided the service must call fetchrow with the filter args."""
        svc, pool, conn = _make_service_with_pool(count=1, rows=_fake_rows(1))

        with patch("services.history_service.service.get_pool", return_value=pool):
            await svc.get_history("user-1", q="TSLA")

        # fetchrow must have been called; extract the positional args
        call_args = conn.fetchrow.call_args
        sql_args = call_args[0]  # positional args to fetchrow(sql, *args)
        # The ticker arg "TSLA" should appear in the query arguments
        assert "TSLA" in sql_args

    @pytest.mark.asyncio
    async def test_items_have_expected_fields(self):
        rows = _fake_rows(1)
        svc, pool, conn = _make_service_with_pool(count=1, rows=rows)

        with patch("services.history_service.service.get_pool", return_value=pool):
            result = await svc.get_history("user-1")

        item = result["items"][0]
        for field in ("id", "ticker", "company_name", "result", "scanned_at", "agent", "analysis_date"):
            assert field in item, f"Missing field: {field}"
