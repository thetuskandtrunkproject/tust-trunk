from supabase import create_client, Client
from app.core.config import settings

# Initialize Supabase client globally with the service-role key
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

def get_db_client() -> Client:
    """
    Dependency to get the Supabase database client.
    """
    return supabase
