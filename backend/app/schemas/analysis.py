from pydantic import BaseModel, Field


class AngleMetrics(BaseModel):
    left_knee: float = 0.0
    right_knee: float = 0.0
    left_elbow: float = 0.0
    right_elbow: float = 0.0
    left_hip: float = 0.0
    right_hip: float = 0.0


class AnalysisResponse(BaseModel):
    exercise: str = "unknown"
    stage: str = "idle"
    rep_count: int = 0
    accuracy_score: float = Field(default=0.0, ge=0, le=100)
    feedback: list[str] = Field(default_factory=list)
    angles: AngleMetrics = Field(default_factory=AngleMetrics)
