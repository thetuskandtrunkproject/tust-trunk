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
    
    # PayPerWA WhatsApp Configuration
    # Channel selector: 'old' (default, +91 94434 60663) or 'new' (+91 96778 50663)
    PAYPERWA_ACTIVE_CHANNEL: str = "old"

    # API Keys (Preserves PAYPERWA_API_KEY for backward compatibility)
    PAYPERWA_API_KEY: str = ""
    PAYPERWA_OLD_API_KEY: str = ""
    PAYPERWA_NEW_API_KEY: str = ""

    # Channel IDs (Optional UUID from PayPerWA Dashboard -> Settings -> API / WhatsApp)
    PAYPERWA_CHANNEL_ID: str = ""
    PAYPERWA_OLD_CHANNEL_ID: str = ""
    PAYPERWA_NEW_CHANNEL_ID: str = ""

    # Phone Identifiers (Reference / Sender metadata)
    PAYPERWA_OLD_PHONE: str = "919443460663"
    PAYPERWA_NEW_PHONE: str = "919677850663"

    # Template Names (Configurable with channel-aware defaults)
    PAYPERWA_OTP_TEMPLATE: str = ""
    PAYPERWA_ORDER_CONFIRMATION_TEMPLATE: str = "order_confirmation"
    PAYPERWA_OWNER_ALERT_TEMPLATE: str = "owner_order_alert"
    PAYPERWA_ORDER_SHIPPED_TEMPLATE: str = "order_shipped"

    # Destination phone number for owner order alerts
    OWNER_WHATSAPP_NUMBER: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
