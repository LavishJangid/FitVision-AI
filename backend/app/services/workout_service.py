from app.exercise_logic.detector import ExerciseAnalyzer
from app.pose_detection.mediapipe_pose import PoseEstimator
from app.schemas.analysis import AnalysisResponse


class WorkoutService:
    def __init__(self) -> None:
        self.pose_estimator = PoseEstimator()
        self.exercise_analyzer = ExerciseAnalyzer()

    def analyze_frame(self, frame_b64: str, exercise: str) -> tuple[AnalysisResponse, str | None]:
        pose_result = self.pose_estimator.estimate(frame_b64)

        if not pose_result.landmarks:
            empty = AnalysisResponse(
                exercise=exercise,
                stage="searching",
                feedback=["Move into camera frame"],
                accuracy_score=0.0,
            )
            return empty, pose_result.annotated_frame_b64

        angles, state, feedback, score = self.exercise_analyzer.analyze(exercise, pose_result.landmarks)

        response = AnalysisResponse(
            exercise=exercise,
            stage=state.stage,
            rep_count=state.rep_count,
            accuracy_score=score,
            feedback=feedback or ["Great form! Keep going"],
            angles=angles,
        )
        return response, pose_result.annotated_frame_b64
