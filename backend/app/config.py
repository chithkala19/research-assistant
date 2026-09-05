from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-1.5-pro"
    GEMINI_STUB_MODE: bool = False

    DATABASE_URL: str
    CHROMA_PERSIST_DIR: str = "./chroma_store"
    UPLOAD_DIR: str = "./uploads"
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    SEMANTIC_SCHOLAR_API_KEY: str = ""
    REDIS_URL: str = "redis://localhost:6379/0"

    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 100
    RETRIEVAL_K: int = 5

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

@lru_cache
def get_settings():
    return Settings()

# Create a global settings instance
settings = get_settings()