from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    sku: str
    category: str
    price: float
    stock: int
    status: str = "In Stock"  # In Stock, Low Stock, Out of Stock
    fit_score_avg: float = Field(..., ge=0, le=100)
    return_rate: float = 0.0
    rating: float = 0.0
    image_url: Optional[str] = None
    tags: List[str] = []

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
