from datetime import datetime

from pydantic import BaseModel, Field


class WorkoutSessionCreate(BaseModel):
    user_id: str = ""
    exercise: str
    duration_seconds: int = Field(ge=1)
    reps: int = Field(ge=0)
    avg_score: float = Field(ge=0, le=100)
    calories: float = Field(ge=0)
    feedback_samples: list[str] = Field(default_factory=list)


class WorkoutSessionRecord(WorkoutSessionCreate):
    id: str
    created_at: datetime


class DashboardStats(BaseModel):
    total_sessions: int
    total_reps: int
    avg_score: float
    total_calories: float
    streak_days: int
