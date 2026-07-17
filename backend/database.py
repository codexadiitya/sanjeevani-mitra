from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client = AsyncIOMotorClient(settings.MONGO_URL)
db = client[settings.DB_NAME]

async def close_db_connection():
    client.close()
