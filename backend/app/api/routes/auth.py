from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import auth_store, get_current_user
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserProfile

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserProfile)
def register(payload: RegisterRequest) -> UserProfile:
    try:
        return auth_store.register(payload.name, payload.email, payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    try:
        token, user = auth_store.login(payload.email, payload.password)
        return AuthResponse(token=token, user=user)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.get("/me", response_model=UserProfile)
def me(user: UserProfile = Depends(get_current_user)) -> UserProfile:
    return user
