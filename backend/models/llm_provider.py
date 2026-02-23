from enum import Enum


class LLMProvider(str, Enum):
    """LLM provider options."""

    OPENAI = "openai"
    ANTHROPIC = "anthropic"
