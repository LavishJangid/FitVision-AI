from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from app.schemas.session import DashboardStats, WorkoutSessionCreate, WorkoutSessionRecord


class SessionStore:
    def __init__(self) -> None:
        self._file_path = Path(__file__).resolve().parents[3] / "database" / "sessions.json"
        self._file_path.parent.mkdir(parents=True, exist_ok=True)
        if not self._file_path.exists():
            self._file_path.write_text("[]", encoding="utf-8")

    def _read(self) -> list[WorkoutSessionRecord]:
        data = json.loads(self._file_path.read_text(encoding="utf-8"))
        return [WorkoutSessionRecord.model_validate(item) for item in data]

    def _write(self, records: list[WorkoutSessionRecord]) -> None:
        payload = [record.model_dump(mode="json") for record in records]
        self._file_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def create(self, session: WorkoutSessionCreate) -> WorkoutSessionRecord:
        records = self._read()
        record = WorkoutSessionRecord(
            id=str(uuid4()),
            created_at=datetime.utcnow(),
            **session.model_dump(),
        )
        records.append(record)
        self._write(records)
        return record

    def list(self, user_id: str, limit: int = 20) -> list[WorkoutSessionRecord]:
        records = self._read()
        scoped = [record for record in records if record.user_id == user_id]
        return sorted(scoped, key=lambda r: r.created_at, reverse=True)[:limit]

    def stats(self, user_id: str) -> DashboardStats:
        records = self._read()
        records = [record for record in records if record.user_id == user_id]
        if not records:
            return DashboardStats(
                total_sessions=0,
                total_reps=0,
                avg_score=0,
                total_calories=0,
                streak_days=0,
            )

        total_sessions = len(records)
        total_reps = sum(r.reps for r in records)
        total_calories = round(sum(r.calories for r in records), 1)
        avg_score = round(sum(r.avg_score for r in records) / total_sessions, 1)
        recent_dates = sorted({r.created_at.date() for r in records}, reverse=True)

        streak = 1
        for i in range(1, len(recent_dates)):
            diff = (recent_dates[i - 1] - recent_dates[i]).days
            if diff == 1:
                streak += 1
            else:
                break

        return DashboardStats(
            total_sessions=total_sessions,
            total_reps=total_reps,
            avg_score=avg_score,
            total_calories=total_calories,
            streak_days=streak,
        )

    def leaderboard(self, limit: int = 10) -> list[dict]:
        records = self._read()
        board: dict[str, dict] = {}
        for record in records:
            if record.user_id not in board:
                board[record.user_id] = {"user_id": record.user_id, "total_reps": 0, "avg_score": 0, "sessions": 0}
            board[record.user_id]["total_reps"] += record.reps
            board[record.user_id]["avg_score"] += record.avg_score
            board[record.user_id]["sessions"] += 1

        result = []
        for item in board.values():
            avg = item["avg_score"] / max(item["sessions"], 1)
            result.append({"user_id": item["user_id"], "total_reps": item["total_reps"], "avg_score": round(avg, 1)})
        return sorted(result, key=lambda x: x["total_reps"], reverse=True)[:limit]
