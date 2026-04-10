from fastapi import APIRouter, Depends, HTTPException
from typing import List
from schemas.cart import CartItemCreate, CartItemResponse
from routes.auth import get_current_user
from database import db
from datetime import datetime, timezone
from bson import ObjectId

router = APIRouter(prefix="/cart", tags=["Cart"])

cart_collection = db.get_collection("cart")

@router.post("/add", response_model=CartItemResponse)
async def add_to_cart(item: CartItemCreate, current_user: dict = Depends(get_current_user)):
    item_dict = item.dict()
    item_dict["user_id"] = current_user["id"]
    item_dict["added_at"] = datetime.now(timezone.utc)
    
    result = await cart_collection.insert_one(item_dict)
    item_dict["id"] = str(result.inserted_id)
    
    return item_dict

@router.get("/", response_model=List[CartItemResponse])
async def get_cart(current_user: dict = Depends(get_current_user)):
    cursor = cart_collection.find({"user_id": current_user["id"]})
    items = await cursor.to_list(length=100)
    
    for item in items:
        item["id"] = str(item["_id"])
        
    return items

@router.delete("/{item_id}")
async def remove_from_cart(item_id: str, current_user: dict = Depends(get_current_user)):
    result = await cart_collection.delete_one({"_id": ObjectId(item_id), "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    return {"status": "success", "message": "Item removed from cart"}
