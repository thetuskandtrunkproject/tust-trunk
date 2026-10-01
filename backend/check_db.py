import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv('backend/.env')

url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
if not url or not key:
    print("Missing supabase credentials")
    exit(1)

supabase = create_client(url, key)
try:
    # Use postgresql direct connection to execute DDL, or if not available, we can't do it via REST.
    print(url)
except Exception as e:
    print(f"Exception: {e}")
