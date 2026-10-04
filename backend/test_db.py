import asyncio
from app.db.supabase import get_db_client

async def test():
    db = get_db_client()
    try:
        res = db.table('site_settings').select('*').limit(1).execute()
        print("Table exists! Res:", res.data)
    except Exception as e:
        print("Table does NOT exist or error:", e)

if __name__ == "__main__":
    asyncio.run(test())
