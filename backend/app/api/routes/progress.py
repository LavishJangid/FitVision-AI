from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.schemas.auth import UserProfile
from app.schemas.session import WorkoutSessionCreate, WorkoutSessionRecord
from app.services.session_store import SessionStore

router = APIRouter(prefix="/progress", tags=["progress"])
store = SessionStore()


@router.post("/sessions", response_model=WorkoutSessionRecord)
def create_session(payload: WorkoutSessionCreate, user: UserProfile = Depends(get_current_user)) -> WorkoutSessionRecord:
    payload.user_id = user.id
    return store.create(payload)


@router.get("/sessions", response_model=list[WorkoutSessionRecord])
def list_sessions(limit: int = 20, user: UserProfile = Depends(get_current_user)) -> list[WorkoutSessionRecord]:
    return store.list(user_id=user.id, limit=limit)


@router.get("/stats")
def get_stats(user: UserProfile = Depends(get_current_user)) -> dict:
    return store.stats(user_id=user.id).model_dump()


@router.get("/leaderboard")
def get_leaderboard(limit: int = 10) -> list[dict]:
    return store.leaderboard(limit=limit)


@router.get("/challenges")
def get_challenges(user: UserProfile = Depends(get_current_user)) -> list[dict]:
    stats = store.stats(user_id=user.id)
    return [
        {"title": "Rep Quest", "target": 100, "progress": stats.total_reps, "unit": "reps"},
        {"title": "Form Mastery", "target": 90, "progress": stats.avg_score, "unit": "score"},
        {"title": "7-Day Streak", "target": 7, "progress": stats.streak_days, "unit": "days"},
    ]
