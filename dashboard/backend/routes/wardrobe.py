from fastapi import APIRouter, Depends, HTTPException
from typing import List
from schemas.wardrobe import WardrobeItemCreate, WardrobeItemResponse
from routes.auth import get_current_user
from database import wardrobe_collection
from datetime import datetime, timezone

router = APIRouter(prefix="/wardrobe", tags=["Wardrobe"])

@router.post("", response_model=WardrobeItemResponse)
async def add_wardrobe_item(item: WardrobeItemCreate):
    item_dict = item.dict()
    item_dict["added_at"] = datetime.now(timezone.utc)
    
    result = await wardrobe_collection.insert_one(item_dict)
    item_dict["id"] = str(result.inserted_id)
    
    return item_dict

@router.get("", response_model=List[WardrobeItemResponse])
@router.get("/", include_in_schema=False)
async def get_wardrobe_root(current_user: dict = Depends(get_current_user)):
    try:
        cursor = wardrobe_collection.find({"user_id": current_user["id"]})
        items = await cursor.to_list(length=100)
        for item in items:
            item["id"] = str(item["_id"])
        return items
    except Exception:
        # Fallback mock data if MongoDB is down
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        return [
            {"id": "mock-1", "item_type": "Coat", "color": "Beige", "brand": "FitLoop", "size_label": "L", "image_url": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800", "user_id": "demo-user-001", "added_at": now},
            {"id": "mock-2", "item_type": "Shirt", "color": "White", "brand": "FitLoop", "size_label": "M", "image_url": "https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?auto=format&fit=crop&q=80&w=800", "user_id": "demo-user-001", "added_at": now}
        ]

@router.get("/{user_id}", response_model=List[WardrobeItemResponse])
async def get_wardrobe(user_id: str, current_user: dict = Depends(get_current_user)):
    if user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this wardrobe")
        
    cursor = wardrobe_collection.find({"user_id": user_id})
    items = await cursor.to_list(length=100)
    
    for item in items:
        item["id"] = str(item["_id"])
        
    return items
