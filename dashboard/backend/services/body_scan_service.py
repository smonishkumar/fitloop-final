from __future__ import annotations

import importlib.util
import threading
from pathlib import Path
from typing import Any, Callable, Dict, Optional


def _clamp(value: float, min_value: float, max_value: float) -> float:
    return max(min_value, min(max_value, value))


def _to_float(value: Any, default: float) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return float(default)


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


_AI_PROCESS_FRAME: Optional[Callable[[bytes, float], Dict[str, Any]]] = None
_AI_LOAD_ERROR: Optional[str] = None
_AI_LOAD_LOCK = threading.Lock()


def _resolve_ai_pipeline_path() -> Path:
    repo_root = Path(__file__).resolve().parents[3]
    candidates = [
        repo_root / "ai-service" / "ml_pipeline.py",
        repo_root / "ai-services" / "ml_pipeline.py",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate

    raise RuntimeError(
        "New AI model pipeline was not found. Expected one of: "
        + ", ".join(str(path) for path in candidates)
    )


def _load_ai_process_frame() -> Callable[[bytes, float], Dict[str, Any]]:
    global _AI_PROCESS_FRAME, _AI_LOAD_ERROR

    if _AI_PROCESS_FRAME is not None:
        return _AI_PROCESS_FRAME
    if _AI_LOAD_ERROR is not None:
        raise RuntimeError(_AI_LOAD_ERROR)

    with _AI_LOAD_LOCK:
        if _AI_PROCESS_FRAME is not None:
            return _AI_PROCESS_FRAME
        if _AI_LOAD_ERROR is not None:
            raise RuntimeError(_AI_LOAD_ERROR)

        try:
            pipeline_path = _resolve_ai_pipeline_path()
            spec = importlib.util.spec_from_file_location(
                "fitforge_ai_service_ml_pipeline",
                str(pipeline_path),
            )
            if spec is None or spec.loader is None:
                raise RuntimeError(f"Could not load spec for {pipeline_path}")

            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)

            process_frame = getattr(module, "process_frame", None)
            if not callable(process_frame):
                raise RuntimeError(
                    f"{pipeline_path} does not expose a callable process_frame(front_image_bytes, height_cm)"
                )

            _AI_PROCESS_FRAME = process_frame
            return process_frame
        except Exception as exc:
            _AI_LOAD_ERROR = f"Failed to initialize new AI measurement model: {exc}"
            raise RuntimeError(_AI_LOAD_ERROR) from exc


def _map_ai_output_to_measurements(
    ai_output: Dict[str, Any],
    height_cm: float,
    weight_kg: Optional[float],
    body_type_hint: Optional[str],
) -> Dict[str, Any]:
    chest = _to_float(ai_output.get("chest_cm"), height_cm * 0.53)
    waist = _to_float(ai_output.get("waist_cm"), height_cm * 0.45)
    hip = _to_float(ai_output.get("hip_cm"), height_cm * 0.55)
    shoulder = _to_float(ai_output.get("shoulder_width_cm"), height_cm * 0.255)
    inseam = _to_float(ai_output.get("inseam_cm"), height_cm * 0.45)

    thigh = _to_float(ai_output.get("thigh_circumference_cm"), hip * 0.56)
    knee = _to_float(ai_output.get("knee_circumference_cm"), thigh * 0.66)
    calf = _to_float(ai_output.get("calf_circumference_cm"), thigh * 0.72)

    shirt_length = _to_float(ai_output.get("shirt_length_cm"), height_cm * 0.365)
    torso = _to_float(ai_output.get("torso_cm"), shirt_length * 0.88)
    arm_length = _to_float(ai_output.get("arm_length_cm"), height_cm * 0.36)

    forearm = _to_float(ai_output.get("forearm_cm"), arm_length * 0.36)
    wrist = _to_float(ai_output.get("wrist_cm"), forearm * 0.72)
    bicep = _to_float(ai_output.get("bicep_cm"), arm_length * 0.39)
    neck = _to_float(ai_output.get("neck_cm"), chest * 0.37)
    ankle = _to_float(ai_output.get("ankle_cm"), knee * 0.58)

    chest = _clamp(chest, height_cm * 0.34, height_cm * 0.72)
    waist = _clamp(waist, height_cm * 0.28, height_cm * 0.62)
    hip = _clamp(hip, height_cm * 0.38, height_cm * 0.80)
    shoulder = _clamp(shoulder, height_cm * 0.17, height_cm * 0.28)
    inseam = _clamp(inseam, height_cm * 0.36, height_cm * 0.54)

    torso = _clamp(torso, 45.0, 80.0)
    arm_length = _clamp(arm_length, 50.0, 84.0)
    thigh = _clamp(thigh, 42.0, 80.0)
    knee = _clamp(knee, 30.0, 56.0)
    ankle = _clamp(ankle, 18.0, 35.0)
    forearm = _clamp(forearm, 20.0, 39.0)
    wrist = _clamp(wrist, 13.0, 23.0)
    bicep = _clamp(bicep, 24.0, 48.0)
    neck = _clamp(neck, 31.0, 50.0)
    _ = calf  # Keeps the mapped field explicit even though schema does not store it yet.

    model_confidence = _clamp(_to_float(ai_output.get("model_confidence"), 0.72), 0.0, 1.0)

    resolved_body_type = (
        ai_output.get("body_type")
        or body_type_hint
        or _classify_body_type(chest, waist, shoulder)
    )

    return {
        "chest": round(chest, 2),
        "waist": round(waist, 2),
        "hip": round(hip, 2),
        "shoulder": round(shoulder, 2),
        "inseam": round(inseam, 2),
        "neck": round(neck, 2),
        "thigh": round(thigh, 2),
        "arm_length": round(arm_length, 2),
        "torso": round(torso, 2),
        "knee": round(knee, 2),
        "ankle": round(ankle, 2),
        "wrist": round(wrist, 2),
        "forearm": round(forearm, 2),
        "bicep": round(bicep, 2),
        "body_type": str(resolved_body_type),
        "model_confidence": round(model_confidence, 3),
        "confidence_score": round(model_confidence * 100.0, 2),
        "height": round(height_cm, 2),
        "weight": round(weight_kg, 2) if weight_kg is not None and weight_kg > 0 else None,
        "calibration_mode": str(ai_output.get("calibration_mode") or "ai_service_pipeline"),
    }


def process_body_scan(
    image_bytes: bytes,
    height_cm: float = 170.0,
    weight_kg: Optional[float] = None,
    gender: Optional[str] = None,
    body_type: Optional[str] = None,
) -> Dict[str, Any]:
    # gender is currently accepted for API compatibility but the new model does not require it.
    _ = gender

    if not image_bytes:
        raise ValueError("Uploaded image is empty")

    safe_height = _clamp(_to_float(height_cm, 170.0), 145.0, 210.0)
    safe_weight = _to_float(weight_kg, 0.0) if weight_kg is not None else None

    ai_process_frame = _load_ai_process_frame()

    try:
        ai_output = ai_process_frame(image_bytes, safe_height)
    except Exception as exc:
        raise RuntimeError(f"New AI model processing failed: {exc}") from exc

    if not isinstance(ai_output, dict):
        raise RuntimeError("New AI model returned an invalid response format")

    return _map_ai_output_to_measurements(
        ai_output=ai_output,
        height_cm=safe_height,
        weight_kg=safe_weight,
        body_type_hint=body_type,
    )
