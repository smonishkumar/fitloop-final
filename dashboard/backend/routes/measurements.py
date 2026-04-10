from fastapi import APIRouter, Depends, HTTPException
from schemas.measurement import MeasurementCreate, MeasurementResponse
from routes.auth import get_current_user
from database import measurements_collection
from datetime import datetime, timezone

router = APIRouter(prefix="/measurements", tags=["Measurements"])

@router.post("", response_model=MeasurementResponse)
async def save_measurements(measurement: MeasurementCreate, current_user: dict = Depends(get_current_user)):
    meas_dict = measurement.dict()
    meas_dict["user_id"] = current_user["id"]
    meas_dict["confidence_score"] = 95.0  # Placeholder confidence
    meas_dict["timestamp"] = datetime.now(timezone.utc)
    
    result = await measurements_collection.insert_one(meas_dict)
    meas_dict["id"] = str(result.inserted_id)
    
    return meas_dict

@router.get("/{user_id}", response_model=MeasurementResponse)
async def get_measurements(user_id: str, current_user: dict = Depends(get_current_user)):
    if user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view these measurements")
        
    # Get the latest measurement document
    cursor = measurements_collection.find({"user_id": user_id}).sort("timestamp", -1).limit(1)
    measurements = await cursor.to_list(length=1)
    
    if not measurements:
        raise HTTPException(status_code=404, detail="Measurements not found")
        
    meas = measurements[0]
    meas["id"] = str(meas["_id"])
    return meas
