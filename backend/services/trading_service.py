import logging
from pathlib import Path
import sys
from typing import AsyncGenerator
import os
import asyncio
from enum import Enum

from models import AnalysisRequest

logger = logging.getLogger(__name__)


class ProviderURL(Enum):
    """Enum for LLM provider API base URLs."""

    OPENAI = "https://api.openai.com/v1"
    ANTHROPIC = "https://api.anthropic.com/"
    GOOGLE = "https://generativelanguage.googleapis.com/v1"
    OPENROUTER = "https://openrouter.ai/api/v1"
    OLLAMA = "http://localhost:11434/v1"

    @classmethod
    def get_url(cls, provider: str) -> str:
        """Get the URL for a provider by name (case-insensitive).

        Args:
            provider: Provider name (e.g., 'openai', 'anthropic', 'OpenAI')

        Returns:
            str: The base URL for the provider

        Raises:
            ValueError: If provider is not found
        """
        try:
            return cls[provider.upper()].value
        except KeyError:
            raise ValueError(f"Unknown provider: {provider}. Valid providers: {', '.join([p.name.lower() for p in cls])}")


class TradingService:
    """
    Service for managing trading analysis via trading agent framework

    This service abstracts the interaction with the trading agent framework, allowing for real or mock analysis based on availability.
    It provides methods to run analysis and stream results, handling both real and mock scenarios seamlessly.
    """

    def __init__(self):
        """
        Initialize the trading service.
        Checks for the availability of the trading agent framework and sets the mode accordingly.
        """

        self.mock_mode = not self._check_trading_agent_availability()

        if self.mock_mode:
            logger.warning("Trading agent framework not available. Running in mock mode.")
        else:
            logger.info("Trading agent framework detected. Running in real mode.")

    @property
    def is_real_mode(self) -> bool:
        """
        Check if the service is running in real mode.
        Returns:
            bool: True if running in real mode, False if in mock mode.
        """
        return not self.mock_mode

    def _check_trading_agent_availability(self) -> bool:
        """Check if the trading agent framework is available."""

        try:
            """Attempt to import a core component of the trading agent framework to verify availability."""
            framework_path = Path(__file__).parent.parent / "tradingagents"

            print(f"Checking for trading agent framework at: {framework_path}")

            """Check if the expected framework directory exists."""
            if not framework_path.exists():
                logger.warning(f"Trading Agent framework not found : {framework_path}")
                return False

            # Check if the main trading_graph module file exists
            trading_graph_file = framework_path / "graph" / "trading_graph.py"
            if not trading_graph_file.exists():
                logger.warning(f"Trading graph module not found: {trading_graph_file}")
                return False

            # Add the backend directory to sys.path so `tradingagents` can be imported
            backend_dir = str(framework_path.parent.resolve())
            if backend_dir not in sys.path:
                sys.path.insert(0, backend_dir)

            return True

        except Exception as e:
            logger.error(f"Error checking TradingAgents availability: {e}")
            return False

    async def run_analysis(self, request: AnalysisRequest):
        """
        Run the trading analysis based on the provided request.

        Arguments:
            request: AnalysisRequest - The request containing analysis parameters.
        Yields:
            str: Streaming messages from the analysis process.
        """
        if self.mock_mode:
            async for message in self._run_mock_analysis(request):
                yield message
        else:
            async for message in self._run_real_analysis(request):
                yield message

    async def _run_real_analysis(self, request: AnalysisRequest) -> AsyncGenerator[str, None]:
        try:
            from tradingagents.graph.trading_graph import TradingAgentsGraph

            yield "=" * 60
            yield f"REAL MODE: Analyzing {request.ticker}"
            yield f"Date: {request.analysis_date}"
            yield f"LLM Provider: {request.llm_provider.value}"
            yield f"Models: {request.shallow_model} / {request.deep_model}"
            yield "=" * 60

            # Build configuration
            config = self._build_config(request)
            yield f"Configuration built successfully"

            # Determine which analysts to enable
            selected_analysts = []
            if request.analysts.market:
                selected_analysts.append("market")
            if request.analysts.social:
                selected_analysts.append("social")
            if request.analysts.news:
                selected_analysts.append("news")
            if request.analysts.fundamentals:
                selected_analysts.append("fundamentals")
            if request.analysts.momentum:
                selected_analysts.append("momentum")

            yield f"Creating trading graph for {request.ticker}..."
            yield f"Selected analysts: {', '.join(selected_analysts)}"

            # Initialize the trading graph
            trading_graph = TradingAgentsGraph(
                selected_analysts=selected_analysts,
                debug=False,
                config=config,
            )

            yield "Graph created successfully"
            yield "Starting analysis workflow..."

            import concurrent.futures

            # Run the propagate method in a separate thread to avoid blocking the event loop
            loop = asyncio.get_event_loop()

            # Forward propagate through the graph
            # Note: The propagate method is expected to yield log messages during execution
            def run_propagate():
                return trading_graph.propagate(request.ticker, str(request.analysis_date))

            # Stream progress updates
            yield f"Analyzing {request.ticker} for {request.analysis_date}..."
            yield "Processing analyst reports..."

            # Run in executor to not block the event loop
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = loop.run_in_executor(executor, run_propagate)

                # Provide periodic updates while waiting
                update_count = 0
                try:
                    while not future.done():
                        await asyncio.sleep(2)
                        update_count += 1
                        yield f"Analysis in progress... ({update_count * 2}s elapsed)"
                except asyncio.CancelledError:
                    # If cancelled, try to cancel the future (though thread may continue)
                    future.cancel()
                    yield "Analysis cancellation requested..."
                    # Wait a bit for graceful shutdown
                    await asyncio.sleep(1)
                    raise  # Re-raise to propagate cancellation

                # Get the result
                final_state, signal = await future

            # Extract final_trade_decision from state (handle both dict and object)
            final_decision = None
            if isinstance(final_state, dict):
                final_decision = final_state.get("final_trade_decision")
                investment_plan = final_state.get("investment_plan")
                judge_decision = final_state.get("investment_debate_state", {}).get("judge_decision")
            else:
                final_decision = getattr(final_state, "final_trade_decision", None)
                investment_plan = getattr(final_state, "investment_plan", None)
                judge_decision = getattr(getattr(final_state, "investment_debate_state", {}), "judge_decision", None)

            # Build the complete final decision message as a single formatted string
            decision_parts = []
            decision_parts.append("")
            decision_parts.append("=" * 60)
            decision_parts.append("Analysis completed successfully!")
            decision_parts.append("=" * 60)
            decision_parts.append("")
            decision_parts.append("=" * 60)
            decision_parts.append("FINAL TRADING DECISION")
            decision_parts.append("=" * 60)
            decision_parts.append(f"Ticker: {request.ticker}")
            decision_parts.append(f"Date: {request.analysis_date}")
            decision_parts.append("")

            # Add final decision
            if final_decision:
                decision_parts.append("Final Decision:")
                decision_parts.append("─" * 60)
                decision_parts.append(final_decision)
                decision_parts.append("")

            # Add investment plan if available
            if investment_plan:
                decision_parts.append("Investment Plan:")
                decision_parts.append("─" * 60)
                decision_parts.append(investment_plan)
                decision_parts.append("")

            # Add judge decision if available
            if judge_decision:
                decision_parts.append("Risk Assessment:")
                decision_parts.append("─" * 60)
                decision_parts.append(judge_decision)
                decision_parts.append("")

            # Yield the complete formatted decision as a single message
            yield "\n".join(decision_parts)

        except Exception as e:
            logger.error(f"Error during real analysis: {e}", exc_info=True)
            yield "-" * 60
            yield f"ERROR : {str(e)}"
            yield "Analysis failed. Check logs from details."
            yield "-" * 60

    async def _run_mock_analysis(self, request: AnalysisRequest) -> AsyncGenerator[str, None]:
        """Run mock analysis for testing without TradingAgents."""

        yield "=" * 60
        yield f"MOCK MODE: Analyzing request.ticker"
        yield f"Date: {request.analysis_date}"
        yield f"Research Depth: {request.research_depth.value}"
        yield "=" * 60
        yield ""
        # Simulate analyst phase
        yield "Phase 1: Analyst Reports"
        yield "─" * 60

        analysts = {
            "market": "Market Analyst",
            "social": "Social Media Analyst",
            "news": "News Analyst",
            "fundamentals": "Fundamentals Analyst",
            "momentum": "Momentum Analyst",
        }

        for key, name in analysts.items():
            if getattr(request.analysts, key):
                yield f"Running {name}..."
                await asyncio.sleep(0.8)
                yield f"  ✓ {name} completed"
                await asyncio.sleep(0.3)

        yield ""
        yield "Phase 2: Research Analysis"
        yield "─" * 60

        researchers = ["Bull Researcher", "Bear Researcher", "Research Manager"]
        for researcher in researchers:
            yield f"Running {researcher}..."
            await asyncio.sleep(0.9)
            yield f"  ✓ {researcher} completed"
            await asyncio.sleep(0.3)

        yield ""
        yield "Phase 3: Trading Decision"
        yield "─" * 60
        yield "Generating trading recommendation..."
        await asyncio.sleep(1.0)
        yield "  ✓ Trader completed"

        yield ""
        yield "Phase 4: Risk Assessment"
        yield "─" * 60

        risk_profiles = ["Conservative", "Neutral", "Aggressive"]
        for profile in risk_profiles:
            yield f"{profile} risk assessment..."
            await asyncio.sleep(0.6)
            yield f"  → {profile} debater completed"
            await asyncio.sleep(0.3)

        yield ""
        yield "Generating final portfolio decision..."
        await asyncio.sleep(1.0)

        # Mock decision
        import random

        decisions = ["BUY", "SELL", "HOLD"]
        decision = random.choice(decisions)
        confidence = random.randint(60, 95)
        risk_levels = ["Low", "Medium", "High"]
        risk_level = random.choice(risk_levels)
        position_size = random.randint(5, 25)

        yield ""
        yield "=" * 60
        yield "FINAL TRADING DECISION"
        yield "=" * 60
        yield f"Ticker: {request.ticker}"
        yield f"Signal: {decision}"
        yield ""
        yield "Decision Details:"
        yield f"  Action: {decision}"
        yield f"  Confidence: {confidence}%"
        yield f"  Risk Level: {risk_level}"
        yield f"  Position Size: {position_size}% of portfolio"
        yield f"  Analysis Date: {request.analysis_date}"
        yield ""
        yield "=" * 60
        yield "Analysis completed successfully!"
        yield "=" * 60
        yield ""
        yield "ℹ️  NOTE: This is MOCK MODE"
        yield "To use real TradingAgents:"
        yield "  1. Ensure tradingagents package is installed"
        yield "  2. Configure API keys in .env"
        yield "  3. Restart the backend server"

    def _build_config(self, request: AnalysisRequest) -> dict:
        """Build configuration dict for TradingAgents framework."""
        from tradingagents.default_config import DEFAULT_CONFIG

        # Get the project root directory (Trading Agent folder)
        project_root = Path(__file__).parent.parent.parent.parent

        # Start with framework defaults
        config = DEFAULT_CONFIG.copy()
        config["project_dir"] = str(project_root)
        config["analysis_date"] = str(request.analysis_date)
        config["max_debate_rounds"] = request.research_depth.value
        config["max_risk_discuss_rounds"] = request.research_depth.value
        config["llm_provider"] = request.llm_provider.value
        config["backend_url"] = ProviderURL.get_url(request.llm_provider.value)
        config["quick_think_llm"] = request.shallow_model
        config["deep_think_llm"] = request.deep_model

        # Override with request-specific settings
        config.update(
            {
                # "openai_api_key": os.getenv("OPENAI_API_KEY"),
                # "anthropic_api_key": os.getenv("ANTHROPIC_API_KEY"),
                # "alpha_vantage_api_key": os.getenv("ALPHA_VANTAGE_API_KEY"),
                "ticker": request.ticker,
            }
        )

        return config
