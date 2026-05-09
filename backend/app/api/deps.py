from fastapi import Header, HTTPException

from app.schemas.auth import UserProfile
from app.services.auth_store import AuthStore

auth_store = AuthStore()


def get_current_user(authorization: str | None = Header(default=None)) -> UserProfile:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    token = authorization.replace("Bearer ", "", 1).strip()
    user = auth_store.user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user
