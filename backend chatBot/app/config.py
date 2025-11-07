import os
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

class Settings(BaseModel):
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    JWT_SECRET: str = os.getenv("JWT_SECRET", "change_me")
    JWT_ALG: str = os.getenv("JWT_ALG", "HS256")
    ADMIN_API_KEYS: list[str] = [k.strip() for k in os.getenv("ADMIN_API_KEYS", "").split(",") if k.strip()]

    ALLOWED_ORIGINS: list[str] = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5500").split(",") if o.strip()]
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()
