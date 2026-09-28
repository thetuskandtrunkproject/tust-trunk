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
