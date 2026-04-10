from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WardrobeItemCreate(BaseModel):
    item_type: str
    color: str
    brand: str
    size_label: str
    image_url: Optional[str] = None

class WardrobeItemResponse(WardrobeItemCreate):
    id: str
    user_id: str
    added_at: datetime
