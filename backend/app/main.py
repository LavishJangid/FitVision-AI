from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
from app.api.routes.progress import router as progress_router
from app.api.routes.workout import router as workout_router
from app.core.config import settings

app = FastAPI(title=settings.app_name, version="0.1.0")

origins = [origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(workout_router)
app.include_router(progress_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "FitVision AI backend running"}
