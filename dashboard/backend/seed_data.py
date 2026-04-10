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
    
    # Sample Products
    products = [
        {
            "name": "Luxe Trench Coat",
            "sku": "LT-2024-XP",
            "category": "Outerwear",
            "price": 289.00,
            "stock": 42,
            "status": "In Stock",
            "fit_score_avg": 94.2,
            "return_rate": 4.2,
            "rating": 4.9,
            "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCrXlsKmmWao1cdiD6a_5AUbdF9sZX2ThiHlMSzqAPexY3W9pMIy2Un33KLs_E1BEVWNgrR1brKBuRQK8xGX6nfMaRQp40sAZPjveqZHqXuESGsssv99fQ6Q3XjAY-iySv0ylQXt50gqLQ1vkDxwYduld3gGii5az80JQt9rnyaIcQN9e6FK7kWFv4psuByQjDAHxVwusJx-5NI6OMdjYKHysffTvrCyjy176KFClrqUaBGL2FKnxTbJQljsqtKtHmpSxm7H72DyQ",
            "tags": ["Premium", "Winter", "Formal"]
        },
        {
            "name": "Aero-Max Trainers",
            "sku": "AM-99-BL",
            "category": "Footwear",
            "price": 165.00,
            "stock": 12,
            "status": "Low Stock",
            "fit_score_avg": 88.5,
            "return_rate": 18.5,
            "rating": 3.2,
            "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuC3rIb0-BZ8LfTJYvvMd7a2i8TM5vnfk0zFD-_SkjMAL9AP-9Y-hJPVrgpFVdpvw0PZ1ZsV8A6bKa0Jkaz3OsTa3jCxTorbdedA0pXSxdJmP29pzr-Gu77bONoMZB4LpXSxdJmP29pzr-Gu77bONoMZB4LpNcxtgjGqERKmNgAOWxhTiyCuJzIRH6ZIeQZNicQf45zX8CoiHHY6y6OsLHCDLQCYCxiU5RxeOTb-qnVxKQkWrHqqsU3Hr3u0Krj2RVZ2riy7Aym2KJiprslS6J8qyqPmraKAm61OkimOg",
            "tags": ["Sport", "Performance"]
        },
        {
            "name": "Oversized Knit",
            "sku": "OK-20-RD",
            "category": "Tops",
            "price": 120.50,
            "stock": 85,
            "status": "In Stock",
            "fit_score_avg": 91.0,
            "return_rate": 7.1,
            "rating": 4.8,
            "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDEAVizJo8-IZ90uUSN3B0HPci6rNyAxrR7gLlec-SWmTzJOJG43NrLAUdd1vkcrhU91VDaAz26v3iVi-G1vkxKZbCMKa8X0Jfyrx_qL1GWHaPPrUzbtdsXpQzwTKNY_vZrsmY9Ttsp3ZpRU2w4DstUd9q2yEFmgcMaoFk1PuaE_9jJg9swqCbNNGvVofNno6QeZvvOZTocjoXy9LkKy9lBKmtam7cs0q_rYnSXqwGHOiLQK3jEa2sNt_G8XxyvnR8RAhuvq79OOA",
            "tags": ["Casual", "Autumn"]
        }
    ]
    
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
        },
        {
            "order_id": "#FL-9422",
            "customer_name": "Marcus Chen",
            "customer_email": "m.chen@tech.co",
            "product_name": "Aero-Max Trainers",
            "status": "Shipped",
            "fit_score": 42,
            "return_risk": "High",
            "amount": 165.00,
            "date": datetime(2023, 10, 14),
            "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuC3rIb0-BZ8LfTJYvvMd7a2i8TM5vnfk0zFD-_SkjMAL9AP-9Y-hJPVrgpFVdpvw0PZ1ZsV8A6bKa0Jkaz3OsTa3jCxTorbdedA0pXSxdJmP29pzr-Gu77bONoMZB4LpXSxdJmP29pzr-Gu77bONoMZB4LpNcxtgjGqERKmNgAOWxhTiyCuJzIRH6ZIeQZNicQf45zX8CoiHHY6y6OsLHCDLQCYCxiU5RxeOTb-qnVxKQkWrHqqsU3Hr3u0Krj2RVZ2riy7Aym2KJiprslS6J8qyqPmraKAm61OkimOg"
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
