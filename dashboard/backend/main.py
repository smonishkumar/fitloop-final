from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import auth, measurements, wardrobe, fitscore, recommendations, products, orders, analytics

app = FastAPI(
    title="FitLoop Backend API",
    description="AI-powered fashion sizing and styling engine",
    version="1.0.0"
)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(measurements.router)
app.include_router(wardrobe.router)
app.include_router(fitscore.router)
app.include_router(recommendations.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(analytics.router)

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "message": "FitLoop API is running"}
