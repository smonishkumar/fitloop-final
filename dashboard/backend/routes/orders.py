from fastapi import APIRouter, HTTPException
from typing import List
from database import orders_collection
from schemas.order import Order, OrderCreate
from bson import ObjectId

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

@router.get("/", response_model=List[Order])
async def get_orders():
    orders = await orders_collection.find().to_list(100)
    for order in orders:
        order["_id"] = str(order["_id"])
    return orders

@router.post("/", response_model=Order)
async def create_order(order: OrderCreate):
    new_order = await orders_collection.insert_one(order.dict())
    created_order = await orders_collection.find_one({"_id": new_order.inserted_id})
    created_order["_id"] = str(created_order["_id"])
    return created_order

@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await orders_collection.find_one({"_id": ObjectId(order_id)})
    if order:
        order["_id"] = str(order["_id"])
        return order
    raise HTTPException(status_code=404, detail="Order not found")
