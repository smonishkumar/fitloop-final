from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import wardrobe_collection, measurements_collection
from services.gemini_service import get_outfit_recommendations

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

class RecommendationResponse(BaseModel):
    recommendations: str

class GenerateRecommendationRequest(BaseModel):
    user_id: str

@router.post("/generate", response_model=RecommendationResponse)
async def generate_recommendations(request: GenerateRecommendationRequest):
    user_id = request.user_id
    
    # Get wardrobe items
    cursor = wardrobe_collection.find({"user_id": user_id})
    items = await cursor.to_list(length=100)
    
    if not items:
        raise HTTPException(status_code=404, detail="No wardrobe items found for this user")
    
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
    try:
        recs = await get_outfit_recommendations(items, body_type)
        return RecommendationResponse(recommendations=recs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini Service Error: {str(e)}")

@router.get("/{user_id}", response_model=RecommendationResponse)
async def get_recommendations(user_id: str):
    # This endpoint is kept for reference but also updated to remove JWT as requested for the module
    cursor = wardrobe_collection.find({"user_id": user_id})
    items = await cursor.to_list(length=100)
    
    meas_cursor = measurements_collection.find({"user_id": user_id}).sort("timestamp", -1).limit(1)
    measurements = await meas_cursor.to_list(length=1)
    
    body_type = "standard"
    if measurements and "body_type" in measurements[0] and measurements[0]["body_type"]:
        body_type = measurements[0]["body_type"]
        
    recs = await get_outfit_recommendations(items, body_type)
    return RecommendationResponse(recommendations=recs)
