from __future__ import annotations

import hashlib
import json
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from app.schemas.auth import UserProfile


class AuthStore:
    def __init__(self) -> None:
        db_root = Path(__file__).resolve().parents[3] / "database"
        db_root.mkdir(parents=True, exist_ok=True)
        self.users_path = db_root / "users.json"
        self.tokens_path = db_root / "tokens.json"
        if not self.users_path.exists():
            self.users_path.write_text("[]", encoding="utf-8")
        if not self.tokens_path.exists():
            self.tokens_path.write_text("{}", encoding="utf-8")

    def _read_users(self) -> list[dict]:
        return json.loads(self.users_path.read_text(encoding="utf-8"))

    def _write_users(self, users: list[dict]) -> None:
        self.users_path.write_text(json.dumps(users, indent=2), encoding="utf-8")

    def _read_tokens(self) -> dict[str, str]:
        return json.loads(self.tokens_path.read_text(encoding="utf-8"))

    def _write_tokens(self, tokens: dict[str, str]) -> None:
        self.tokens_path.write_text(json.dumps(tokens, indent=2), encoding="utf-8")

    def _hash_password(self, password: str) -> str:
        return hashlib.sha256(password.encode("utf-8")).hexdigest()

    def register(self, name: str, email: str, password: str) -> UserProfile:
        users = self._read_users()
        normalized_email = email.strip().lower()
        if any(user["email"] == normalized_email for user in users):
            raise ValueError("Email already exists")

        new_user = {
            "id": str(uuid4()),
            "name": name.strip(),
            "email": normalized_email,
            "password_hash": self._hash_password(password),
            "created_at": datetime.utcnow().isoformat(),
        }
        users.append(new_user)
        self._write_users(users)
        return UserProfile.model_validate({k: v for k, v in new_user.items() if k != "password_hash"})

    def login(self, email: str, password: str) -> tuple[str, UserProfile]:
        users = self._read_users()
        normalized_email = email.strip().lower()
        match = next((user for user in users if user["email"] == normalized_email), None)
        if not match or match["password_hash"] != self._hash_password(password):
            raise ValueError("Invalid email or password")

        token = str(uuid4())
        tokens = self._read_tokens()
        tokens[token] = match["id"]
        self._write_tokens(tokens)
        profile = UserProfile.model_validate({k: v for k, v in match.items() if k != "password_hash"})
        return token, profile

    def user_by_token(self, token: str) -> UserProfile | None:
        token_map = self._read_tokens()
        user_id = token_map.get(token)
        if not user_id:
            return None

        users = self._read_users()
        match = next((user for user in users if user["id"] == user_id), None)
        if not match:
            return None
        return UserProfile.model_validate({k: v for k, v in match.items() if k != "password_hash"})
