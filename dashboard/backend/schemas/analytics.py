from pydantic import BaseModel
from typing import List, Dict

class KPIItem(BaseModel):
    label: str
    value: str
    change: str
    trend: str
    color: str
    down: bool = False

class ChartDataPoint(BaseModel):
    label: str
    value: float

class CategoryPerformance(BaseModel):
    category: str
    score: float
    color: str

class AnalyticsSummary(BaseModel):
    kpis: List[KPIItem]
    performance_trends: List[ChartDataPoint]
    category_performance: List[CategoryPerformance]
    regional_data: List[Dict]
