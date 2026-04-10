from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from routes.auth import get_current_user
from database import wardrobe_collection, measurements_collection
from services.gemini_service import get_outfit_recommendations

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

class RecommendationResponse(BaseModel):
    recommendations: str

@router.get("/{user_id}", response_model=RecommendationResponse)
async def get_recommendations(user_id: str, current_user: dict = Depends(get_current_user)):
    if user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Get wardrobe items
    cursor = wardrobe_collection.find({"user_id": user_id})
    items = await cursor.to_list(length=100)
    
    for item in items:
        item["id"] = str(item["_id"])
        del item["_id"]
        
    # Get user body type
    meas_cursor = measurements_collection.find({"user_id": user_id}).sort("timestamp", -1).limit(1)
    measurements = await meas_cursor.to_list(length=1)
    
    body_type = "standard"
    if measurements and "body_type" in measurements[0] and measurements[0]["body_type"]:
        body_type = measurements[0]["body_type"]
        
    # Get recommendations from Gemini
    recs = await get_outfit_recommendations(items, body_type)
    
    return RecommendationResponse(recommendations=recs)
