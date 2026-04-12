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
    try:
        products = await products_collection.find().to_list(100)
        for product in products:
            product["_id"] = str(product["_id"])
        return products
    except Exception:
        # Fallback to some static items for demo if DB is down
        return [
            {"_id": "p1", "name": "Classic Oxford Shirt", "sku": "OX-001", "category": "Shirts", "price": 89.0, "stock": 100, "status": "In Stock", "fit_score_avg": 95.0, "image_url": "https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?auto=format&fit=crop&q=80&w=800"},
            {"_id": "p2", "name": "Selvedge Jeans", "sku": "SJ-001", "category": "Bottoms", "price": 125.0, "stock": 50, "status": "In Stock", "fit_score_avg": 92.0, "image_url": "https://images.unsplash.com/photo-1542272604-787c38ad5551?auto=format&fit=crop&q=80&w=800"}
        ]

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
