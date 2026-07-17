import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class Settings:
    MONGO_URL: str = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    DB_NAME: str = os.environ.get('DB_NAME', 'test_database')
    CORS_ORIGINS: list[str] = os.environ.get('CORS_ORIGINS', '*').split(',')

settings = Settings()
