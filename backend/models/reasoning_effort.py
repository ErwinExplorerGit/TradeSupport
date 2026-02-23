from enum import Enum


class ReasoningEffort(str, Enum):
    """OpenAI reasoning effort levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
