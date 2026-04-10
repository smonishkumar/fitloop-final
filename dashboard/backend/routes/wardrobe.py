from fastapi import APIRouter, Depends, HTTPException
from typing import List
from schemas.wardrobe import WardrobeItemCreate, WardrobeItemResponse
from routes.auth import get_current_user
from database import wardrobe_collection
from datetime import datetime, timezone

router = APIRouter(prefix="/wardrobe", tags=["Wardrobe"])

@router.post("", response_model=WardrobeItemResponse)
async def add_wardrobe_item(item: WardrobeItemCreate, current_user: dict = Depends(get_current_user)):
    item_dict = item.dict()
    item_dict["user_id"] = current_user["id"]
    item_dict["added_at"] = datetime.now(timezone.utc)
    
    result = await wardrobe_collection.insert_one(item_dict)
    item_dict["id"] = str(result.inserted_id)
    
    return item_dict

@router.get("/{user_id}", response_model=List[WardrobeItemResponse])
async def get_wardrobe(user_id: str, current_user: dict = Depends(get_current_user)):
    if user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this wardrobe")
        
    cursor = wardrobe_collection.find({"user_id": user_id})
    items = await cursor.to_list(length=100)
    
    for item in items:
        item["id"] = str(item["_id"])
        
    return items
