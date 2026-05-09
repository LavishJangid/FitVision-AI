import numpy as np


def calculate_angle(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
    """
    Calculates the angle ABC in degrees.
    """
    ba = a - b
    bc = c - b

    denominator = (np.linalg.norm(ba) * np.linalg.norm(bc)) + 1e-8
    cosine = np.dot(ba, bc) / denominator
    cosine = np.clip(cosine, -1.0, 1.0)
    angle = np.degrees(np.arccos(cosine))
    return float(angle)
