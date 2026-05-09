from datetime import datetime

from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    email: str
    password: str = Field(min_length=6, max_length=64)


class LoginRequest(BaseModel):
    email: str
    password: str


class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime


class AuthResponse(BaseModel):
    token: str
    user: UserProfile
