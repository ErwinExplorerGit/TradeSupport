"""
Services module for TradeSupport backend.

This module contains all microservices organized in their own folders:
- trading_service: Trading analysis and market research
- auth_service: Authentication and authorization
- history_service: Trading history retrieval
"""

# Import services for backward compatibility
from .trading_service import TradingService
from .auth_service import AuthService
from .history_service import HistoryService

__all__ = ["TradingService", "AuthService", "HistoryService"]
