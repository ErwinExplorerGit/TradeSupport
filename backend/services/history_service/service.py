import logging
from typing import Optional
from config.database import get_pool

logger = logging.getLogger(__name__)


class HistoryService:
    """Service for retrieving user scan history from the database."""

    def __init__(self):
        logger.info("History service initialized")

    async def get_history(
        self,
        user_id: str,
        q: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        """
        Get paginated scan history for a user, optionally filtered by ticker.

        Returns:
            dict with keys: items (list), total (int), page (int), page_size (int)
        """
        pool = get_pool()
        offset = (page - 1) * page_size

        async with pool.acquire() as conn:
            if q:
                count_row = await conn.fetchrow(
                    """
                    SELECT COUNT(*) AS cnt
                    FROM scan_history sh
                    JOIN user_companies uc ON sh.user_company_id = uc.id
                    JOIN companies c ON uc.company_id = c.id
                    WHERE uc.user_id = $1
                      AND (UPPER(c.ticker) = UPPER($2) OR LOWER(c.name) LIKE LOWER($3))
                    """,
                    user_id,
                    q,
                    f"%{q}%",
                )
                rows = await conn.fetch(
                    """
                    SELECT sh.id, c.ticker, c.name AS company_name,
                           sh.result, sh.scanned_at
                    FROM scan_history sh
                    JOIN user_companies uc ON sh.user_company_id = uc.id
                    JOIN companies c ON uc.company_id = c.id
                    WHERE uc.user_id = $1
                      AND (UPPER(c.ticker) = UPPER($2) OR LOWER(c.name) LIKE LOWER($3))
                    ORDER BY sh.scanned_at DESC
                    LIMIT $4 OFFSET $5
                    """,
                    user_id,
                    q,
                    f"%{q}%",
                    page_size,
                    offset,
                )
            else:
                count_row = await conn.fetchrow(
                    """
                    SELECT COUNT(*) AS cnt
                    FROM scan_history sh
                    JOIN user_companies uc ON sh.user_company_id = uc.id
                    WHERE uc.user_id = $1
                    """,
                    user_id,
                )
                rows = await conn.fetch(
                    """
                    SELECT sh.id, c.ticker, c.name AS company_name,
                           sh.result, sh.scanned_at
                    FROM scan_history sh
                    JOIN user_companies uc ON sh.user_company_id = uc.id
                    JOIN companies c ON uc.company_id = c.id
                    WHERE uc.user_id = $1
                    ORDER BY sh.scanned_at DESC
                    LIMIT $2 OFFSET $3
                    """,
                    user_id,
                    page_size,
                    offset,
                )

        items = [
            {
                "id": str(row["id"]),
                "ticker": row["ticker"],
                "company_name": row["company_name"],
                "result": row["result"],
                "scanned_at": row["scanned_at"].isoformat(),
            }
            for row in rows
        ]

        return {
            "items": items,
            "total": count_row["cnt"],
            "page": page,
            "page_size": page_size,
        }
