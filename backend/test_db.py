import asyncio
from app.core.database import get_db_client

async def run_db_test():
    db = get_db_client()
    try:
        res = db.table('site_settings').select('*').limit(1).execute()
        print("Table exists! Res:", res.data)
    except Exception as e:
        print("Table does NOT exist or error:", e)

if __name__ == "__main__":
    asyncio.run(run_db_test())
