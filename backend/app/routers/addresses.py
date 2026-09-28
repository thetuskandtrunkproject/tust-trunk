from fastapi import APIRouter, Depends, Request, status, HTTPException
from typing import List
from slowapi import Limiter
from slowapi.util import get_remote_address
from supabase import Client

from app.core.database import get_db_client
from app.dependencies.auth import get_current_user
from app.schemas.addresses import AddressCreate, AddressUpdate, AddressResponse
from app.services import addresses_service

router = APIRouter(prefix="/api/v1/addresses", tags=["Addresses"])

# Local wrapper to attach the user to request.state without modifying Module 1 dependencies.
# This ensures we don't verify the token twice, and we don't rely on unverified JWT payloads.
def get_and_attach_current_user(request: Request, user: dict = Depends(get_current_user)) -> dict:
    request.state.user = user
    return user

def get_user_id_for_rate_limit(request: Request) -> str:
    # Safely retrieve the already-verified user from request.state.
    user = getattr(request.state, "user", None)
    if user and "id" in user:
        return str(user["id"])
    # Fallback to IP if state is missing (should not happen on auth'd routes)
    return get_remote_address(request)

limiter = Limiter(key_func=get_user_id_for_rate_limit, default_limits=["60/minute"])


@router.get("", response_model=List[AddressResponse])
@limiter.limit("60/minute")
def list_addresses(
    request: Request,
    current_user: dict = Depends(get_and_attach_current_user),
    db: Client = Depends(get_db_client)
):
    """List all addresses for current user."""
    return addresses_service.list_addresses(db, current_user['id'])


@router.post("", response_model=AddressResponse)
@limiter.limit("10/minute")
def create_address(
    request: Request,
    address: AddressCreate,
    current_user: dict = Depends(get_and_attach_current_user),
    db: Client = Depends(get_db_client)
):
    """Create a new address."""
    return addresses_service.create_address(db, current_user['id'], address.model_dump(exclude_unset=True))


@router.get("/{address_id}", response_model=AddressResponse)
@limiter.limit("60/minute")
def get_address(
    request: Request,
    address_id: str,
    current_user: dict = Depends(get_and_attach_current_user),
    db: Client = Depends(get_db_client)
):
    """Get a single address."""
    return addresses_service.get_address(db, current_user['id'], address_id)


@router.put("/{address_id}", response_model=AddressResponse)
@limiter.limit("20/minute")
def update_address(
    request: Request,
    address_id: str,
    address: AddressUpdate,
    current_user: dict = Depends(get_and_attach_current_user),
    db: Client = Depends(get_db_client)
):
    """Update all fields of an address."""
    return addresses_service.update_address(db, current_user['id'], address_id, address.model_dump(exclude_unset=True))


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
def delete_address(
    request: Request,
    address_id: str,
    current_user: dict = Depends(get_and_attach_current_user),
    db: Client = Depends(get_db_client)
):
    """Delete an address."""
    addresses_service.delete_address(db, current_user['id'], address_id)
    return None


@router.patch("/{address_id}/set-default", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("20/minute")
def set_default_address(
    request: Request,
    address_id: str,
    current_user: dict = Depends(get_and_attach_current_user),
    db: Client = Depends(get_db_client)
):
    """Mark address as default; clears previous default atomically."""
    addresses_service.set_default_address(db, current_user['id'], address_id)
    return None
