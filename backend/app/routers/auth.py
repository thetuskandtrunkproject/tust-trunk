from fastapi import APIRouter, Depends, Request, status, HTTPException
from supabase import Client
from slowapi import Limiter
from slowapi.util import get_remote_address
import os
import logging

logger = logging.getLogger(__name__)

from app.schemas.auth import UserResponse, UserUpdate
from app.dependencies.auth import get_token_from_header, get_current_user
from app.core.database import get_db_client
from app.services import auth_service

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# Note: In-memory rate limiting (slowapi) does NOT sync across multiple instances/workers.
# Before horizontal scaling (e.g. running multiple Render instances), this must be 
# replaced with a Redis-backed limiter.
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=os.getenv("REDIS_URL", "memory://")
)

@router.post("/sync", response_model=UserResponse)
@limiter.limit("10/minute")
def sync_profile(request: Request, token: str | None = Depends(get_token_from_header), db: Client = Depends(get_db_client)):
    """
    Syncs Firebase user with local database.
    Creates the user if they don't exist.
    """
    if not token:
        raise HTTPException(status_code=401, detail="Token required")
    user = auth_service.sync_user(db, token)
    return user

@router.get("/me", response_model=UserResponse)
@limiter.limit("60/minute")
def get_me(request: Request, current_user: dict = Depends(get_current_user)):
    """
    Returns the currently authenticated user's profile.
    """
    return current_user

@router.patch("/me", response_model=UserResponse)
@limiter.limit("30/minute")
def update_me(request: Request, updates: UserUpdate, current_user: dict = Depends(get_current_user), db: Client = Depends(get_db_client)):
    """
    Updates the authenticated user's profile (e.g. name, phone).
    """
    updated_user = auth_service.update_user_profile(db, current_user['id'], updates)
    updated_user['email_verified'] = current_user.get('email_verified', False) 
    return updated_user

@router.post("/revoke-all-sessions", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("5/minute")
def revoke_sessions(request: Request, current_user: dict = Depends(get_current_user)):
    """
    Revokes all Firebase refresh tokens for the current user.
    Forces all active sessions to re-authenticate.
    """
    auth_service.revoke_all_sessions(current_user['firebase_uid'])
    return None

from app.schemas.auth import SendOTPRequest, VerifyOTPRequest

@router.post("/send-otp")
@limiter.limit("3/10minutes")
def send_otp(request: Request, payload: SendOTPRequest, db: Client = Depends(get_db_client)):
    """
    Generates and sends an OTP via WhatsApp using PayPerWA.
    """
    try:
        return auth_service.send_otp(db, payload.phone)
    except Exception as e:
        logger.error(f"Failed to send OTP to {payload.phone}: {e}")
        raise HTTPException(
            status_code=502, 
            detail="Failed to send OTP via upstream provider. Please try again later."
        )

@router.post("/verify-otp")
@limiter.limit("5/minute")
def verify_otp(request: Request, payload: VerifyOTPRequest, db: Client = Depends(get_db_client)):
    """
    Verifies an OTP and returns a custom Firebase token for authentication.
    """
    return auth_service.verify_otp(db, payload.phone, payload.otp)
