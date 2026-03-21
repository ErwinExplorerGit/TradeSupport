import logging

logger = logging.getLogger(__name__)


class HistoryService:
    """
    Simple history service for retrieving user trading history.

    This is a minimal implementation for demonstration purposes.
    """

    def __init__(self):
        """Initialize the history service."""
        logger.info("History service initialized")

    def get_history(self, userid: str, ticker: str) -> dict:
        """
        Get history for a user and ticker.

        Args:
            userid: The user ID
            ticker: The stock ticker symbol

        Returns:
            dict: Dictionary containing userid and ticker
        """
        logger.info(f"Fetching history for user {userid} and ticker {ticker}")
        return {"userid": userid, "ticker": ticker}
