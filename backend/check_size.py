import os
import json
from supabase import create_client

url = os.environ.get("SUPABASE_URL", "https://gabchikkidrhcbzexiqq.supabase.co")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhYmNoaWtraWRyaGNiemV4aXFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDUwNDA2OSwiZXhwIjoyMTA2MDgwMDY5fQ.4va04_pDEMoIhPQEq7OD7jidXISlL7rL2_Oa_ZhwkTs")
supabase = create_client(url, key)

res = supabase.rpc('search_public_products', {'page_num': 1, 'page_size': 2}).execute()
data_str = json.dumps(res.data)
print(f"Number of items: {len(res.data)}")
print(f"Total payload size (bytes): {len(data_str)}")
if len(res.data) > 0:
    print(f"First item size (bytes): {len(json.dumps(res.data[0]))}")
