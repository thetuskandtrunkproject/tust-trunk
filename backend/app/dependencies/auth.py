import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from supabase import Client
from app.core.database import get_db_client

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

def get_token_from_header(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str | None:
    if credentials:
        return credentials.credentials
    return None

def get_optional_user(token: str | None = Depends(get_token_from_header), db: Client = Depends(get_db_client)) -> dict | None:
    """
    Dependency that returns the user dict if a valid token is provided.
    If no token is provided, returns None (for guest checkout).
    Raises 401 if a token is provided but it's invalid or revoked.
    """
    if not token:
        return None
        
    try:
        # Mandatory: check_revoked=True to ensure revoked sessions are blocked
        decoded_token = auth.verify_id_token(token, check_revoked=True)
        firebase_uid = decoded_token.get('uid')
        
        response = db.table('users').select('*').eq('firebase_uid', firebase_uid).execute()
        
        if not response.data:
            # Token is valid but user hasn't hit /sync yet
            raise HTTPException(status_code=401, detail="User profile not synced. Please call /sync first.")
            
        user = response.data[0]
        # Expose email_verified directly on the user object per requirement Q-3
        user['email_verified'] = decoded_token.get('email_verified', False)
        return user
        
    except auth.RevokedIdTokenError:
        raise HTTPException(status_code=401, detail="Token has been revoked.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying token: {e}")
        raise HTTPException(status_code=401, detail="Invalid token.")

def get_current_user(user: dict | None = Depends(get_optional_user)) -> dict:
    """
    Dependency that enforces authentication.
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.get('is_active', True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )
        
    return user

def get_current_admin(user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency that enforces authentication and admin role.
    """
    if user.get('role') != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin role required."
        )
    return user
