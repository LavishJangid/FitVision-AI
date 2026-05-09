from __future__ import annotations

import base64
from dataclasses import dataclass

import cv2
import mediapipe as mp
import numpy as np

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils


@dataclass
class PoseResult:
    landmarks: dict[str, np.ndarray] | None
    annotated_frame_b64: str | None


class PoseEstimator:
    def __init__(self) -> None:
        self.pose = mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )

    def _decode_base64_image(self, frame_b64: str) -> np.ndarray | None:
        try:
            if "," in frame_b64:
                frame_b64 = frame_b64.split(",", maxsplit=1)[1]
            binary = base64.b64decode(frame_b64)
            np_arr = np.frombuffer(binary, dtype=np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            return frame
        except Exception:
            return None

    def _encode_base64_image(self, frame: np.ndarray) -> str | None:
        success, jpeg_buffer = cv2.imencode(".jpg", frame)
        if not success:
            return None
        return base64.b64encode(jpeg_buffer.tobytes()).decode("utf-8")

    def estimate(self, frame_b64: str) -> PoseResult:
        frame = self._decode_base64_image(frame_b64)
        if frame is None:
            return PoseResult(landmarks=None, annotated_frame_b64=None)

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = self.pose.process(rgb)

        if not result.pose_landmarks:
            return PoseResult(landmarks=None, annotated_frame_b64=self._encode_base64_image(frame))

        mp_drawing.draw_landmarks(
            frame,
            result.pose_landmarks,
            mp_pose.POSE_CONNECTIONS,
            landmark_drawing_spec=mp_drawing.DrawingSpec(color=(57, 255, 20), thickness=2, circle_radius=2),
            connection_drawing_spec=mp_drawing.DrawingSpec(color=(255, 34, 85), thickness=2),
        )

        h, w, _ = frame.shape
        raw = result.pose_landmarks.landmark
        mapped = {
            "left_shoulder": np.array([raw[11].x * w, raw[11].y * h]),
            "right_shoulder": np.array([raw[12].x * w, raw[12].y * h]),
            "left_elbow": np.array([raw[13].x * w, raw[13].y * h]),
            "right_elbow": np.array([raw[14].x * w, raw[14].y * h]),
            "left_wrist": np.array([raw[15].x * w, raw[15].y * h]),
            "right_wrist": np.array([raw[16].x * w, raw[16].y * h]),
            "left_hip": np.array([raw[23].x * w, raw[23].y * h]),
            "right_hip": np.array([raw[24].x * w, raw[24].y * h]),
            "left_knee": np.array([raw[25].x * w, raw[25].y * h]),
            "right_knee": np.array([raw[26].x * w, raw[26].y * h]),
            "left_ankle": np.array([raw[27].x * w, raw[27].y * h]),
            "right_ankle": np.array([raw[28].x * w, raw[28].y * h]),
        }

        return PoseResult(landmarks=mapped, annotated_frame_b64=self._encode_base64_image(frame))
