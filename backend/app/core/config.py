import os
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    DATABASE_URL: str = "sqlite:///./data/app.db"
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://[::1]:3000",
        "http://0.0.0.0:3000",
    ]
    
    # OpenRouter（优先）或 OpenAI
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    AI_BASE_URL: str = os.getenv("AI_BASE_URL", "https://openrouter.ai/api/v1")
    AI_MODEL: str = os.getenv("AI_MODEL", "openai/gpt-4o-mini")

    UPLOAD_DIR: Path = Path("./data/uploads")
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB

    @property
    def effective_ai_model(self) -> str:
        """OpenRouter 用完整 ID（如 openai/gpt-4o-mini），直接 OpenAI 时去掉 openai/ 前缀"""
        if self.OPENROUTER_API_KEY:
            return self.AI_MODEL
        if "/" in self.AI_MODEL:
            return self.AI_MODEL.split("/", 1)[1]
        return self.AI_MODEL

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
