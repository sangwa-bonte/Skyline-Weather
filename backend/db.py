from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.mongo_uri)
    db = client[settings.db_name]
    # Create indexes
    await db.search_history.create_index("queried_at")
    await db.search_history.create_index("city")
    print(f"Connected to MongoDB: {settings.db_name}")


async def close_db():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_db():
    return db
