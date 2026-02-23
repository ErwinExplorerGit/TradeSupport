from enum import Enum


class AnalysisState(str, Enum):
    """Current state of analysis."""

    IDLE = "idle"
    RUNNING = "running"
    STOPPED = "stopped"
    ERROR = "error"
