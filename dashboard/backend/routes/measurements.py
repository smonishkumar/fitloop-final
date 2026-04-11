from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from schemas.measurement import MeasurementCreate, MeasurementResponse
from routes.auth import get_current_user
from database import measurements_collection
from datetime import datetime, timezone
from typing import Any, Dict

from services.body_scan_service import process_body_scan

router = APIRouter(prefix="/measurements", tags=["Measurements"])


def _to_float(value: Any, default: float) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return float(default)


def _normalize_measurement_doc(raw_doc: Dict[str, Any]) -> Dict[str, Any]:
    height = _to_float(raw_doc.get("height"), 170.0)

    weight_raw = raw_doc.get("weight")
    weight = _to_float(weight_raw, 0.0) if weight_raw is not None else None
    if weight is not None and weight <= 0:
        weight = None

    waist = _to_float(raw_doc.get("waist"), 82.0)
    hip = _to_float(raw_doc.get("hip"), waist + 5.0)
    shoulder = _to_float(raw_doc.get("shoulder"), 44.0)

    chest_fallback = max(height * 0.57, waist + 11.0, shoulder * 2.2)
    chest = _to_float(raw_doc.get("chest"), chest_fallback)

    inseam = _to_float(raw_doc.get("inseam"), height * 0.455)
    torso = _to_float(raw_doc.get("torso"), height * 0.318)
    arm_length = _to_float(raw_doc.get("arm_length"), height * 0.36)

    thigh = _to_float(raw_doc.get("thigh"), (waist * 0.42) + (hip * 0.16))
    knee = _to_float(raw_doc.get("knee"), thigh * 0.72)
    ankle = _to_float(raw_doc.get("ankle"), knee * 0.58)

    forearm = _to_float(raw_doc.get("forearm"), arm_length * 0.36)
    wrist = _to_float(raw_doc.get("wrist"), forearm * 0.72)
    bicep = _to_float(raw_doc.get("bicep"), arm_length * 0.39)
    neck = _to_float(raw_doc.get("neck"), chest * 0.37)

    model_confidence = _to_float(
        raw_doc.get("model_confidence"),
        _to_float(raw_doc.get("confidence_score"), 95.0) / 100.0,
    )
    model_confidence = max(0.0, min(1.0, model_confidence))
    confidence_score = _to_float(raw_doc.get("confidence_score"), model_confidence * 100.0)

    normalized: Dict[str, Any] = {
        "user_id": str(raw_doc.get("user_id", "")),
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
        "height": round(height, 2),
        "weight": round(weight, 2) if weight is not None else None,
        "body_type": raw_doc.get("body_type") or "Average",
        "model_confidence": round(model_confidence, 3),
        "calibration_mode": raw_doc.get("calibration_mode") or "manual_entry",
        "confidence_score": round(confidence_score, 2),
        "timestamp": raw_doc.get("timestamp") or datetime.now(timezone.utc),
    }

    if raw_doc.get("_id") is not None:
        normalized["id"] = str(raw_doc["_id"])
    elif raw_doc.get("id") is not None:
        normalized["id"] = str(raw_doc["id"])

    return normalized

@router.post("", response_model=MeasurementResponse)
async def save_measurements(measurement: MeasurementCreate, current_user: dict = Depends(get_current_user)):
    meas_payload = measurement.model_dump() if hasattr(measurement, "model_dump") else measurement.dict()
    meas_payload["user_id"] = current_user["id"]
    meas_payload["confidence_score"] = _to_float(meas_payload.get("confidence_score"), 95.0)
    meas_payload["model_confidence"] = _to_float(
        meas_payload.get("model_confidence"),
        meas_payload["confidence_score"] / 100.0,
    )
    meas_payload["timestamp"] = datetime.now(timezone.utc)

    normalized = _normalize_measurement_doc(meas_payload)
    to_store = {k: v for k, v in normalized.items() if k != "id"}

    result = await measurements_collection.insert_one(to_store)
    normalized["id"] = str(result.inserted_id)

    return normalized

@router.post("/scan", response_model=MeasurementResponse)
async def scan_body(
    file: UploadFile = File(...),
    height_cm: float = Form(170.0),
    weight_kg: float | None = Form(None),
    gender: str | None = Form(None),
    body_type: str | None = Form(None),
    current_user: dict = Depends(get_current_user),
):
    try:
        image_bytes = await file.read()
        scan_data = process_body_scan(
            image_bytes=image_bytes,
            height_cm=height_cm,
            weight_kg=weight_kg,
            gender=gender,
            body_type=body_type,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to process scan: {exc}") from exc

    scan_data["user_id"] = current_user["id"]
    scan_data["timestamp"] = datetime.now(timezone.utc)

    normalized = _normalize_measurement_doc(scan_data)
    to_store = {k: v for k, v in normalized.items() if k != "id"}

    result = await measurements_collection.insert_one(to_store)
    normalized["id"] = str(result.inserted_id)

    return normalized

@router.get("/{user_id}", response_model=MeasurementResponse)
async def get_measurements(user_id: str, current_user: dict = Depends(get_current_user)):
    if user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view these measurements")
        
    # Get the latest measurement document
    cursor = measurements_collection.find({"user_id": user_id}).sort("timestamp", -1).limit(1)
    measurements = await cursor.to_list(length=1)
    
    if not measurements:
        raise HTTPException(status_code=404, detail="Measurements not found")
        
    return _normalize_measurement_doc(measurements[0])
