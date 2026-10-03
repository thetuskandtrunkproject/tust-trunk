import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv('backend/.env')
supabase = create_client(os.environ.get('SUPABASE_URL'), os.environ.get('SUPABASE_SERVICE_ROLE_KEY'))
res = supabase.table('products').select('id, categories!inner(name, slug)').in_('categories.slug', ['t-shirts', 'shirt']).execute()
print(len(res.data))
