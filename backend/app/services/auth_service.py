import logging
from supabase import Client
from fastapi import HTTPException
from firebase_admin import auth
from app.schemas.auth import UserUpdate

logger = logging.getLogger(__name__)

def sync_user(db: Client, token: str) -> dict:
    """
    Verifies the token and syncs the user profile with the database.
    Creates a new user row if it doesn't exist.
    """
    try:
        decoded = auth.verify_id_token(token, check_revoked=True)
    except auth.RevokedIdTokenError:
        raise HTTPException(status_code=401, detail="Token has been revoked.")
    except Exception as e:
        logger.error(f"Error verifying token in sync: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

    firebase_uid = decoded.get('uid')
    email = decoded.get('email')
    email_verified = decoded.get('email_verified', False)
    name = decoded.get('name')
    
    response = db.table('users').select('*').eq('firebase_uid', firebase_uid).execute()
    
    if not response.data:
        # Create user
        new_user = {
            'firebase_uid': firebase_uid,
            'email': email,
            'full_name': name,
            'email_verified': email_verified,
            'role': 'customer',
            'is_active': True
        }
        res = db.table('users').insert(new_user).execute()
        user = res.data[0]
    else:
        # Update email/email_verified just to keep mirrored data in sync
        user = response.data[0]
        updates = {}
        if user.get('email') != email:
            updates['email'] = email
        if user.get('email_verified') != email_verified:
            updates['email_verified'] = email_verified
            
        if updates:
            res = db.table('users').update(updates).eq('id', user['id']).execute()
            user = res.data[0]
            
    # Always inject current email_verified per Q-3
    user['email_verified'] = email_verified
    return user

def update_user_profile(db: Client, user_id: str, updates: UserUpdate) -> dict:
    update_data = updates.model_dump(exclude_unset=True)
    
    if 'phone' in update_data and update_data['phone']:
        import re
        if not re.match(r'^\d{10}$', update_data['phone']):
            raise HTTPException(status_code=400, detail="Phone number must be exactly 10 digits")

    if not update_data:
        response = db.table('users').select('*').eq('id', user_id).execute()
        return response.data[0]
        
    res = db.table('users').update(update_data).eq('id', user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    return res.data[0]

def revoke_all_sessions(firebase_uid: str):
    try:
        auth.revoke_refresh_tokens(firebase_uid)
    except Exception as e:
        logger.error(f"Error revoking tokens for {firebase_uid}: {e}")
        raise HTTPException(status_code=500, detail="Failed to revoke sessions")

import secrets
import string
import hashlib
from datetime import datetime, timedelta, timezone
from app.services import payperwa_service

def _hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()

def send_otp(db: Client, phone: str):
    # Ensure E.164 format for India
    if len(phone) == 10:
        formatted_phone = f"+91{phone}"
    elif phone.startswith("91") and len(phone) == 12:
        formatted_phone = f"+{phone}"
    else:
        formatted_phone = f"+{phone}"

    # Check limits
    existing_otp = db.table('otps').select('*').eq('phone', formatted_phone).execute().data
    now = datetime.now(timezone.utc)
    
    if existing_otp:
        otp_record = existing_otp[0]
        last_sent = datetime.fromisoformat(otp_record['last_sent_at'].replace('Z', '+00:00'))
        if now - last_sent < timedelta(minutes=1):
            raise HTTPException(status_code=429, detail="Please wait before requesting another OTP.")
        
        if otp_record['send_count'] >= 3:
            if now - last_sent < timedelta(minutes=10):
                raise HTTPException(status_code=429, detail="Too many attempts. Please try again later.")
            else:
                # Reset send count after 10 minutes
                send_count = 0
        else:
            send_count = otp_record['send_count']
    else:
        send_count = 0

    otp = ''.join(secrets.choice(string.digits) for _ in range(6))
    otp_hash = _hash_otp(otp)
    expires_at = now + timedelta(minutes=5)

    upsert_data = {
        'phone': formatted_phone,
        'otp_hash': otp_hash,
        'expires_at': expires_at.isoformat(),
        'attempt_count': 0,
        'last_sent_at': now.isoformat(),
        'send_count': send_count + 1
    }

    db.table('otps').upsert(upsert_data).execute()

    success = payperwa_service.send_otp_message(formatted_phone, otp)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send OTP via WhatsApp.")
    
    return {"success": True, "message": "OTP sent successfully"}

def verify_otp(db: Client, phone: str, otp: str):
    if len(phone) == 10:
        formatted_phone = f"+91{phone}"
    elif phone.startswith("91") and len(phone) == 12:
        formatted_phone = f"+{phone}"
    else:
        formatted_phone = f"+{phone}"

    otp_records = db.table('otps').select('*').eq('phone', formatted_phone).execute().data
    if not otp_records:
        raise HTTPException(status_code=400, detail="No active OTP found. Please request a new one.")
    
    otp_record = otp_records[0]
    now = datetime.now(timezone.utc)
    expires_at = datetime.fromisoformat(otp_record['expires_at'].replace('Z', '+00:00'))

    if now > expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")
    
    if otp_record['attempt_count'] >= 5:
        raise HTTPException(status_code=400, detail="Too many invalid attempts. Please request a new OTP.")

    if otp_record['otp_hash'] != _hash_otp(otp):
        db.table('otps').update({'attempt_count': otp_record['attempt_count'] + 1}).eq('phone', formatted_phone).execute()
        raise HTTPException(status_code=400, detail="Invalid OTP.")

    # OTP is valid, delete it
    db.table('otps').delete().eq('phone', formatted_phone).execute()

    # Get or create Firebase user
    try:
        try:
            firebase_user = auth.get_user_by_phone_number(formatted_phone)
        except auth.UserNotFoundError:
            firebase_user = auth.create_user(phone_number=formatted_phone)
        
        # Generate custom token
        custom_token = auth.create_custom_token(firebase_user.uid)
        return {"success": True, "token": custom_token.decode('utf-8') if isinstance(custom_token, bytes) else custom_token}
    except Exception as e:
        logger.error(f"Error generating custom token: {e}")
        raise HTTPException(status_code=500, detail="Authentication failed during token generation.")
