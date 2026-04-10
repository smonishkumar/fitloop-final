import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client.fitloop

# Collections
users_collection = db.get_collection("users")
measurements_collection = db.get_collection("measurements")
wardrobe_collection = db.get_collection("wardrobe")
fitscore_logs_collection = db.get_collection("fitscore_logs")
products_collection = db.get_collection("products")
orders_collection = db.get_collection("orders")
