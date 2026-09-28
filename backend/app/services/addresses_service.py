from fastapi import HTTPException, status
from supabase import Client

MAX_ADDRESSES_PER_USER = 10

def list_addresses(db: Client, user_id: str) -> list[dict]:
    res = db.table('addresses').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
    return res.data

def create_address(db: Client, user_id: str, address_data: dict) -> dict:
    # Pre-insert count check
    count_res = db.table('addresses').select('id', count='exact').eq('user_id', user_id).execute()
    current_count = count_res.count if count_res.count is not None else 0
    
    if current_count >= MAX_ADDRESSES_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum of {MAX_ADDRESSES_PER_USER} addresses allowed per user."
        )
    
    requested_default = address_data.pop('is_default', False)
    
    # Force default if it's the first address
    if current_count == 0:
        requested_default = True
        
    address_data['user_id'] = user_id
    address_data['is_default'] = False # Insert as false first to avoid unique constraint violations
    
    res = db.table('addresses').insert(address_data).execute()
    new_address = res.data[0]
    
    if requested_default:
        db.rpc('set_default_address', {'p_user_id': user_id, 'p_address_id': new_address['id']}).execute()
        new_address['is_default'] = True
        
    return new_address

def get_address(db: Client, user_id: str, address_id: str) -> dict:
    res = db.table('addresses').select('*').eq('id', address_id).eq('user_id', user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Address not found")
    return res.data[0]

def update_address(db: Client, user_id: str, address_id: str, address_data: dict) -> dict:
    # Ensure it exists and belongs to user
    get_address(db, user_id, address_id)
    
    requested_default = address_data.pop('is_default', None)
    
    if address_data:
        res = db.table('addresses').update(address_data).eq('id', address_id).eq('user_id', user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Address not found")
            
    if requested_default is True:
        db.rpc('set_default_address', {'p_user_id': user_id, 'p_address_id': address_id}).execute()
    elif requested_default is False:
        db.table('addresses').update({'is_default': False}).eq('id', address_id).eq('user_id', user_id).execute()
        
    return get_address(db, user_id, address_id)

def delete_address(db: Client, user_id: str, address_id: str):
    res = db.rpc('delete_address_and_auto_promote', {'p_user_id': user_id, 'p_address_id': address_id}).execute()
    if not res.data:
        # The RPC returns true on success, false if not found.
        # res.data contains the returned boolean.
        raise HTTPException(status_code=404, detail="Address not found")

def set_default_address(db: Client, user_id: str, address_id: str):
    res = db.rpc('set_default_address', {'p_user_id': user_id, 'p_address_id': address_id}).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Address not found")
