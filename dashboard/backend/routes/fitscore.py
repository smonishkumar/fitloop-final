from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from routes.auth import get_current_user
from database import fitscore_logs_collection, measurements_collection, wardrobe_collection
from services.size_predictor import predict_size_and_fit
from datetime import datetime, timezone
from bson.objectid import ObjectId
from bson.errors import InvalidId

router = APIRouter(prefix="/fitscore", tags=["FitScore"])

class FitScoreRequest(BaseModel):
    item_id: str

class FitScoreResponse(BaseModel):
    score: float
    size_predicted: str
    confidence: float

@router.post("", response_model=FitScoreResponse)
async def calculate_fitscore(request: FitScoreRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    # Get user's latest measurements
    cursor = measurements_collection.find({"user_id": user_id}).sort("timestamp", -1).limit(1)
    measurements = await cursor.to_list(length=1)
    
    if not measurements:
        raise HTTPException(status_code=400, detail="User measurements not found. Please add measurements first.")
    
    meas = measurements[0]
    
    # Check if wardrobe item exists
    try:
        obj_id = ObjectId(request.item_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid item_id format")

    item = await wardrobe_collection.find_one({"_id": obj_id})
    if not item:
        raise HTTPException(status_code=404, detail="Wardrobe item not found")
    
    # Calculate fit predictions
    fit_data = predict_size_and_fit(
        meas.get("chest", 0), 
        meas.get("waist", 0), 
        meas.get("hip", 0), 
        meas.get("shoulder", 0)
    )
    
    log_entry = {
        "user_id": user_id,
        "item_id": request.item_id,
        "score": fit_data["fit_score"],
        "size_predicted": fit_data["predicted_size"],
        "confidence": fit_data["confidence"],
        "timestamp": datetime.now(timezone.utc)
    }
    await fitscore_logs_collection.insert_one(log_entry)
    
    return FitScoreResponse(
        score=fit_data["fit_score"],
        size_predicted=fit_data["predicted_size"],
        confidence=fit_data["confidence"]
    )
