from __future__ import annotations

from dataclasses import dataclass

from app.schemas.analysis import AngleMetrics
from app.utils.angles import calculate_angle


@dataclass
class SessionState:
    rep_count: int = 0
    stage: str = "idle"


class ExerciseAnalyzer:
    def __init__(self) -> None:
        self.state_by_exercise: dict[str, SessionState] = {
            "squat": SessionState(),
            "pushup": SessionState(),
            "plank": SessionState(),
        }

    def _angles(self, landmarks: dict) -> AngleMetrics:
        return AngleMetrics(
            left_knee=calculate_angle(landmarks["left_hip"], landmarks["left_knee"], landmarks["left_ankle"]),
            right_knee=calculate_angle(landmarks["right_hip"], landmarks["right_knee"], landmarks["right_ankle"]),
            left_elbow=calculate_angle(landmarks["left_shoulder"], landmarks["left_elbow"], landmarks["left_wrist"]),
            right_elbow=calculate_angle(landmarks["right_shoulder"], landmarks["right_elbow"], landmarks["right_wrist"]),
            left_hip=calculate_angle(landmarks["left_shoulder"], landmarks["left_hip"], landmarks["left_knee"]),
            right_hip=calculate_angle(landmarks["right_shoulder"], landmarks["right_hip"], landmarks["right_knee"]),
        )

    def _detect_squat(self, state: SessionState, angles: AngleMetrics) -> tuple[SessionState, list[str]]:
        knee = (angles.left_knee + angles.right_knee) / 2
        hip = (angles.left_hip + angles.right_hip) / 2
        feedback: list[str] = []

        if knee < 95:
            state.stage = "down"
        if knee > 160 and state.stage == "down":
            state.stage = "up"
            state.rep_count += 1

        if knee > 120:
            feedback.append("Lower your squat deeper")
        if hip < 55:
            feedback.append("Keep your back straight")
        return state, feedback

    def _detect_pushup(self, state: SessionState, angles: AngleMetrics) -> tuple[SessionState, list[str]]:
        elbow = (angles.left_elbow + angles.right_elbow) / 2
        hip = (angles.left_hip + angles.right_hip) / 2
        feedback: list[str] = []

        if elbow < 85:
            state.stage = "down"
        if elbow > 155 and state.stage == "down":
            state.stage = "up"
            state.rep_count += 1

        if elbow > 105:
            feedback.append("Lower your chest more")
        if hip < 145:
            feedback.append("Keep your back straight")
        return state, feedback

    def _detect_plank(self, state: SessionState, angles: AngleMetrics) -> tuple[SessionState, list[str]]:
        hip = (angles.left_hip + angles.right_hip) / 2
        elbow = (angles.left_elbow + angles.right_elbow) / 2
        feedback: list[str] = []
        state.stage = "hold"

        if hip < 150:
            feedback.append("Raise your hips slightly")
        if hip > 178:
            feedback.append("Lower your hips slightly")
        if elbow < 70 or elbow > 115:
            feedback.append("Align your elbows under shoulders")

        if not feedback:
            state.rep_count += 1
        return state, feedback

    def analyze(self, exercise: str, landmarks: dict) -> tuple[AngleMetrics, SessionState, list[str], float]:
        exercise = exercise.lower()
        if exercise not in self.state_by_exercise:
            exercise = "squat"

        angles = self._angles(landmarks)
        state = self.state_by_exercise[exercise]

        if exercise == "squat":
            state, feedback = self._detect_squat(state, angles)
        elif exercise == "pushup":
            state, feedback = self._detect_pushup(state, angles)
        else:
            state, feedback = self._detect_plank(state, angles)

        raw_score = 100 - (len(feedback) * 20)
        score = max(40.0, float(raw_score))
        return angles, state, feedback, score
