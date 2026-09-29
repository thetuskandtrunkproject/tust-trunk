from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str = "http://localhost:54321"
    SUPABASE_SERVICE_ROLE_KEY: str = "placeholder_key"
    FIREBASE_SERVICE_ACCOUNT_JSON: str = "{}"
    FRONTEND_URL: str = ""

    # Razorpay credentials.
    # KEY_ID   — public identifier, safe to send to the frontend for Checkout.js init.
    # KEY_SECRET — signs embedded checkout signatures (order_id|payment_id).
    #              NEVER expose to the frontend or log.
    # WEBHOOK_SECRET — separate secret used to verify Razorpay's server-to-server
    #                  webhook payloads. NEVER confuse with KEY_SECRET.
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

