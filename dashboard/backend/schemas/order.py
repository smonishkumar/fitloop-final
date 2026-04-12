from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class OrderBase(BaseModel):
    order_id: str
    customer_name: str
    customer_email: str
    product_name: str
    status: str  # Delivered, Shipped, Processing, Returned
    fit_score: int = Field(..., ge=0, le=100)
    return_risk: str  # Low, Medium, High
    amount: float
    date: datetime
    image_url: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
