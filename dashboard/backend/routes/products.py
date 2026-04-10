from fastapi import APIRouter, HTTPException, Depends
from typing import List
from database import products_collection
from schemas.product import Product, ProductCreate
from bson import ObjectId

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

@router.get("/", response_model=List[Product])
async def get_products():
    products = await products_collection.find().to_list(100)
    for product in products:
        product["_id"] = str(product["_id"])
    return products

@router.post("/", response_model=Product)
async def create_product(product: ProductCreate):
    new_product = await products_collection.insert_one(product.dict())
    created_product = await products_collection.find_one({"_id": new_product.inserted_id})
    created_product["_id"] = str(created_product["_id"])
    return created_product

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await products_collection.find_one({"_id": ObjectId(product_id)})
    if product:
        product["_id"] = str(product["_id"])
        return product
    raise HTTPException(status_code=404, detail="Product not found")
