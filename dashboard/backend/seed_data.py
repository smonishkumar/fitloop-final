import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client.fitloop

async def seed_data():
    print("Starting database seeding...")
    
    import json
    try:
        with open("../public/data/catalog.json", "r") as f:
            catalog = json.load(f)
    except FileNotFoundError:
        print("catalog.json not found")
        catalog = []

    products = []
    for item in catalog:
        products.append({
            "name": item.get("name", "Unknown"),
            "sku": f"SKU-{item.get('id', '000')}",
            "category": item.get("category", "Uncategorized"),
            "price": float(item.get("price", 0.0)),
            "stock": 42,
            "status": "In Stock",
            "fit_score_avg": 92.5,
            "return_rate": 2.1,
            "rating": 4.8,
            "image_url": item.get("image_url", ""),
            "tags": [item.get("category", "")]
        })
    
    # Sample Orders
    orders = [
        {
            "order_id": "#FL-9421",
            "customer_name": "Sarah Adams",
            "customer_email": "s.adams@cloud.com",
            "product_name": "Luxe Trench Coat",
            "status": "Delivered",
            "fit_score": 94,
            "return_risk": "Low",
            "amount": 289.00,
            "date": datetime(2023, 10, 12),
            "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCrXlsKmmWao1cdiD6a_5AUbdF9sZX2ThiHlMSzqAPexY3W9pMIy2Un33KLs_E1BEVWNgrR1brKBuRQK8xGX6nfMaRQp40sAZPjveqZHqXuESGsssv99fQ6Q3XjAY-iySv0ylQXt50gqLQ1vkDxwYduld3gGii5az80JQt9rnyaIcQN9e6FK7kWFv4psuByQjDAHxVwusJx-5NI6OMdjYKHysffTvrCyjy176KFClrqUaBGL2FKnxTbJQljsqtKtHmpSxm7H72DyQ"
        }
    ]
    
    # Clear existing data (Optional, handle with care)
    await db.products.delete_many({})
    await db.orders.delete_many({})
    
    # Insert new data
    if products:
        await db.products.insert_many(products)
    if orders:
        await db.orders.insert_many(orders)
        
    print(f"Successfully seeded {len(products)} products and {len(orders)} orders.")

if __name__ == "__main__":
    asyncio.run(seed_data())
