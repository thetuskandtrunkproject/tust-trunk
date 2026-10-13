import httpx
from supabase import create_client, Client, ClientOptions
from app.core.config import settings

# Initialize Supabase client globally with safe HTTP/1.1 connection pooling.
# Disabling HTTP/2 prevents RemoteProtocolError (<ConnectionTerminated error_code:1>)
# when idle connections are dropped by Cloudflare/Supabase gateway.
options = ClientOptions(
    httpx_client=httpx.Client(
        http2=False,
        limits=httpx.Limits(
            max_keepalive_connections=10,
            max_connections=30,
            keepalive_expiry=15.0
        ),
        timeout=httpx.Timeout(30.0, connect=10.0)
    )
)

supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY,
    options=options
)

def get_db_client() -> Client:
    """
    Dependency to get the Supabase database client.
    """
    return supabase
