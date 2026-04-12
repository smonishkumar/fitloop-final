from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class CartItemBase(BaseModel):
    product_id: str
    name: str
    price: float
    category: str
    image_url: str
    quantity: int = 1
    size: Optional[str] = "M"

class CartItemCreate(CartItemBase):
    pass

class CartItemResponse(CartItemBase):
    id: str
    user_id: str
    added_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
