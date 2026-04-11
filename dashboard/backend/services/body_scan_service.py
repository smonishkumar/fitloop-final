from __future__ import annotations

import math
from typing import Any, Dict, Optional

import cv2
import numpy as np

try:
    import mediapipe as mp
except Exception:  # pragma: no cover - optional dependency at runtime
    mp = None

CHEST_MIN_HEIGHT_RATIO = 0.57
CHEST_MIN_WAIST_DELTA_CM = 10.0
CHEST_MIN_WAIST_DELTA_HIGH_CM = 13.0
CHEST_MIN_SHOULDER_MULTIPLIER = 2.25


def _clamp(value: float, min_value: float, max_value: float) -> float:
    return max(min_value, min(max_value, value))


def _to_float(value: Any, default: float) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return float(default)


def _decode_image(image_bytes: bytes) -> np.ndarray:
    if not image_bytes:
        raise ValueError("Uploaded image is empty")

    frame = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        raise ValueError("Could not decode the uploaded image")

    return frame


def _bmi(height_cm: float, weight_kg: Optional[float]) -> float:
    if not weight_kg or weight_kg <= 0:
        return 22.0
    height_m = max(height_cm / 100.0, 1.0)
    return _clamp(weight_kg / (height_m * height_m), 16.0, 38.0)


def _body_type_factor(body_type: Optional[str]) -> float:
    mapping = {
        "slim": 0.93,
        "athletic": 1.03,
        "average": 1.0,
        "husky": 1.08,
    }
    return mapping.get((body_type or "").strip().lower(), 1.0)


def _gender_waist_bias(gender: Optional[str]) -> float:
    g = (gender or "").strip().lower()
    if g.startswith("f"):
        return -2.0
    if g.startswith("m"):
        return 1.2
    return 0.0


def _ensure_chest_floor(chest_cm: float, waist_cm: float, shoulder_cm: float, height_cm: float) -> float:
    waist_delta = CHEST_MIN_WAIST_DELTA_HIGH_CM if waist_cm >= 88 else CHEST_MIN_WAIST_DELTA_CM
    chest_floor = max(
        height_cm * CHEST_MIN_HEIGHT_RATIO,
        waist_cm + waist_delta,
        shoulder_cm * CHEST_MIN_SHOULDER_MULTIPLIER,
    )
    return max(chest_cm, chest_floor)


def _classify_body_type(chest_cm: float, waist_cm: float, shoulder_cm: float) -> str:
    drop = chest_cm - waist_cm
    shoulder_ratio = shoulder_cm / max(waist_cm, 1.0)

    if drop >= 16 or shoulder_ratio >= 0.56:
        return "Athletic"
    if drop <= 7:
        return "Husky"
    if drop <= 10:
        return "Average"
    return "Slim"


def _build_base_measurements(
    height_cm: float,
    weight_kg: Optional[float],
    gender: Optional[str],
    body_type: Optional[str],
) -> Dict[str, float]:
    safe_height = _clamp(_to_float(height_cm, 170.0), 145.0, 210.0)
    bmi = _bmi(safe_height, _to_float(weight_kg, 0.0) if weight_kg is not None else None)
    frame_factor = 1.0 + (bmi - 22.0) * 0.018
    shape_factor = _body_type_factor(body_type)
    waist_bias = _gender_waist_bias(gender)

    waist_cm = safe_height * 0.458 * frame_factor * shape_factor + waist_bias
    waist_cm = _clamp(waist_cm, 62.0, 120.0)

    hip_gap = 7.0 if (gender or "").strip().lower().startswith("f") else 5.0
    hip_cm = _clamp(waist_cm + hip_gap + (shape_factor - 1.0) * 8.0, 78.0, 128.0)

    shoulder_cm = _clamp(safe_height * 0.252 * (1.0 + (shape_factor - 1.0) * 0.6), 36.0, 58.0)
    chest_raw_cm = shoulder_cm * 2.15 + (hip_cm - waist_cm) * 0.35 + (bmi - 22.0) * 0.7
    chest_cm = _ensure_chest_floor(chest_raw_cm, waist_cm, shoulder_cm, safe_height)

    inseam_cm = _clamp(safe_height * 0.455, 62.0, 97.0)
    torso_cm = _clamp(safe_height * 0.318, 45.0, 78.0)
    arm_length_cm = _clamp(safe_height * 0.36, 50.0, 82.0)

    thigh_cm = _clamp((waist_cm * 0.42) + (hip_cm * 0.16), 42.0, 76.0)
    knee_cm = _clamp(thigh_cm * 0.72, 30.0, 54.0)
    ankle_cm = _clamp(knee_cm * 0.58, 18.0, 34.0)

    forearm_cm = _clamp(arm_length_cm * 0.36, 20.0, 38.0)
    wrist_cm = _clamp(forearm_cm * 0.72, 13.0, 23.0)
    bicep_cm = _clamp(arm_length_cm * 0.39, 24.0, 46.0)
    neck_cm = _clamp(chest_cm * 0.37, 31.0, 49.0)

    return {
        "chest": chest_cm,
        "waist": waist_cm,
        "hip": hip_cm,
        "shoulder": shoulder_cm,
        "inseam": inseam_cm,
        "neck": neck_cm,
        "thigh": thigh_cm,
        "arm_length": arm_length_cm,
        "torso": torso_cm,
        "knee": knee_cm,
        "ankle": ankle_cm,
        "wrist": wrist_cm,
        "forearm": forearm_cm,
        "bicep": bicep_cm,
    }


def _extract_pose_features(frame_bgr: np.ndarray, height_cm: float) -> Optional[Dict[str, float]]:
    if mp is None:
        return None

    image_h, image_w = frame_bgr.shape[:2]
    frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)

    with mp.solutions.pose.Pose(
        static_image_mode=True,
        model_complexity=1,
        min_detection_confidence=0.5,
    ) as pose:
        results = pose.process(frame_rgb)

    if not results.pose_landmarks:
        return None

    lm = results.pose_landmarks.landmark

    def dist_px(idx_a: int, idx_b: int) -> float:
        ax, ay = lm[idx_a].x * image_w, lm[idx_a].y * image_h
        bx, by = lm[idx_b].x * image_w, lm[idx_b].y * image_h
        return math.hypot(ax - bx, ay - by)

    required = [11, 12, 23, 24, 27, 28]
    visibility = sum(_clamp(float(lm[idx].visibility), 0.0, 1.0) for idx in required) / len(required)

    shoulder_span_px = dist_px(11, 12)
    hip_span_px = dist_px(23, 24)
    torso_span_px = (dist_px(11, 23) + dist_px(12, 24)) / 2.0

    arm_span_px = (
        dist_px(11, 13)
        + dist_px(13, 15)
        + dist_px(12, 14)
        + dist_px(14, 16)
    ) / 2.0

    leg_chain_px = (
        dist_px(23, 25)
        + dist_px(25, 27)
        + dist_px(24, 26)
        + dist_px(26, 28)
    ) / 2.0

    visible_height_px = max((max(lm[27].y, lm[28].y) - lm[0].y) * image_h, image_h * 0.32)
    px_to_cm = height_cm / max(visible_height_px, 1.0)

    return {
        "visibility": visibility,
        "shoulder_span_cm": shoulder_span_px * px_to_cm,
        "hip_span_cm": hip_span_px * px_to_cm,
        "torso_span_cm": torso_span_px * px_to_cm,
        "arm_span_cm": arm_span_px * px_to_cm,
        "leg_chain_cm": leg_chain_px * px_to_cm,
        "shoulder_to_hip_ratio": shoulder_span_px / max(hip_span_px, 1.0),
    }


def _blend_pose_measurements(
    base: Dict[str, float],
    pose_features: Dict[str, float],
    height_cm: float,
) -> Dict[str, float]:
    blended = dict(base)

    ratio = _clamp(pose_features["shoulder_to_hip_ratio"], 0.7, 1.6)

    shoulder_from_pose = pose_features["shoulder_span_cm"] * 0.8
    hip_from_pose = pose_features["hip_span_cm"] * 2.35

    blended["shoulder"] = _clamp(base["shoulder"] * 0.62 + shoulder_from_pose * 0.38, 36.0, 58.0)
    blended["hip"] = _clamp(base["hip"] * 0.6 + hip_from_pose * 0.4, 78.0, 130.0)

    chest_multiplier = _clamp(1.0 + (ratio - 1.0) * 0.28, 0.88, 1.16)
    waist_multiplier = _clamp(1.0 - (ratio - 1.0) * 0.14, 0.9, 1.12)

    blended["chest"] = base["chest"] * chest_multiplier
    blended["waist"] = base["waist"] * waist_multiplier

    torso_from_pose = pose_features["torso_span_cm"] * 0.95
    arm_from_pose = pose_features["arm_span_cm"] * 0.98

    blended["torso"] = _clamp(base["torso"] * 0.65 + torso_from_pose * 0.35, 45.0, 80.0)
    blended["arm_length"] = _clamp(base["arm_length"] * 0.7 + arm_from_pose * 0.3, 50.0, 84.0)

    inseam_from_pose = pose_features["leg_chain_cm"] * 0.48
    blended["inseam"] = _clamp(base["inseam"] * 0.72 + inseam_from_pose * 0.28, 62.0, 99.0)

    blended["thigh"] = _clamp((blended["waist"] * 0.42) + (blended["hip"] * 0.16), 42.0, 78.0)
    blended["knee"] = _clamp(blended["thigh"] * 0.72, 30.0, 55.0)
    blended["ankle"] = _clamp(blended["knee"] * 0.58, 18.0, 35.0)

    blended["forearm"] = _clamp(blended["arm_length"] * 0.36, 20.0, 38.0)
    blended["wrist"] = _clamp(blended["forearm"] * 0.72, 13.0, 23.0)
    blended["bicep"] = _clamp(blended["arm_length"] * 0.39, 24.0, 46.0)
    blended["neck"] = _clamp(blended["chest"] * 0.37, 31.0, 49.0)

    blended["chest"] = _ensure_chest_floor(blended["chest"], blended["waist"], blended["shoulder"], height_cm)

    return blended


def process_body_scan(
    image_bytes: bytes,
    height_cm: float = 170.0,
    weight_kg: Optional[float] = None,
    gender: Optional[str] = None,
    body_type: Optional[str] = None,
) -> Dict[str, Any]:
    safe_height = _clamp(_to_float(height_cm, 170.0), 145.0, 210.0)
    safe_weight = _to_float(weight_kg, 0.0) if weight_kg is not None else None

    frame = _decode_image(image_bytes)
    base = _build_base_measurements(safe_height, safe_weight, gender, body_type)

    pose_features = _extract_pose_features(frame, safe_height)
    if pose_features:
        measurements = _blend_pose_measurements(base, pose_features, safe_height)
        model_confidence = _clamp(0.64 + pose_features["visibility"] * 0.3, 0.62, 0.98)
        calibration_mode = "pose_assisted"
    else:
        measurements = base
        model_confidence = 0.72
        calibration_mode = "anthropometric_fallback"

    output: Dict[str, Any] = {
        **{k: round(v, 2) for k, v in measurements.items()},
        "body_type": body_type or _classify_body_type(
            measurements["chest"],
            measurements["waist"],
            measurements["shoulder"],
        ),
        "model_confidence": round(model_confidence, 3),
        "confidence_score": round(model_confidence * 100.0, 2),
        "height": round(safe_height, 2),
        "weight": round(safe_weight, 2) if safe_weight is not None and safe_weight > 0 else None,
        "calibration_mode": calibration_mode,
    }

    return output
