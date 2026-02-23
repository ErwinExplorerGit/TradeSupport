from enum import Enum


class ResearchDepth(int, Enum):
    """Research depth options."""

    SHALLOW = 1
    MEDIUM = 3
    DEEP = 5
