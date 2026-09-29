from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str = "http://localhost:54321"
    SUPABASE_SERVICE_ROLE_KEY: str = "placeholder_key"
    FIREBASE_SERVICE_ACCOUNT_JSON: str = "{}"
    FRONTEND_URL: str = ""
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
