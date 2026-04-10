from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MeasurementCreate(BaseModel):
    chest: float
    waist: float
    hip: float
    shoulder: float
    inseam: float
    neck: float
    thigh: float
    arm_length: float
    torso: float
    knee: float
    ankle: float
    wrist: float
    forearm: float
    bicep: float
    body_type: Optional[str] = None

class MeasurementResponse(MeasurementCreate):
    id: str
    user_id: str
    confidence_score: float
    timestamp: datetime
