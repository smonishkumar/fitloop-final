from fastapi import APIRouter
from typing import List
from schemas.analytics import AnalyticsSummary

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

@router.get("/summary", response_model=AnalyticsSummary)
async def get_analytics_summary():
    # In a real app, this would be computed or fetched from a cache
    return {
        "kpis": [
            { "label": "Try-On Dynamics", "value": "403K", "change": "+12.4%", "trend": "up", "color": "primary" },
            { "label": "Returns Optimized", "value": "28.6K", "change": "+8.2%", "trend": "up", "color": "secondary" },
            { "label": "Capital Traction", "value": "₹2.4Cr", "change": "+18.9%", "trend": "up", "color": "tertiary" },
            { "label": "Volatility Delta", "value": "9.8%", "change": "-2.4%", "trend": "down", "color": "error", "down": True }
        ],
        "performance_trends": [
            { "label": "WK 28", "value": 60 },
            { "label": "WK 29", "value": 85 },
            { "label": "WK 30", "value": 45 },
            { "label": "WK 31", "value": 92 },
            { "label": "WK 32", "value": 98 }
        ],
        "category_performance": [
            { "category": "Evening Wear", "score": 98.2, "color": "secondary" },
            { "category": "Casual Essentials", "score": 94.5, "color": "secondary" },
            { "category": "Denim Dynamics", "score": 89.1, "color": "tertiary" },
            { "category": "Strategic Outerwear", "score": 91.8, "color": "secondary" }
        ],
        "regional_data": [
            { "name": "Maharashtra Unit", "users": "124.5K", "engagement": "Peak", "color": "bg-secondary" },
            { "name": "Karnataka Core", "users": "98.2K", "engagement": "High", "color": "bg-primary" },
            { "name": "Delhi NCR Hub", "users": "86.4K", "engagement": "Stable", "color": "bg-tertiary" },
            { "name": "Tamil Nadu Node", "users": "72.1K", "engagement": "Growth", "color": "bg-slate-400" }
        ]
    }
