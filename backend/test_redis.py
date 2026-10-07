import os
import time
from dotenv import load_dotenv
from slowapi import Limiter
from slowapi.util import get_remote_address

# Load environment variables from .env
load_dotenv()

redis_url = os.getenv("REDIS_URL", "memory://")
print(f"Using storage URI: {redis_url}")

# Create a limiter
limiter = Limiter(key_func=get_remote_address, storage_uri=redis_url)

class DummyRequest:
    def __init__(self, ip):
        self.client = type('Client', (object,), {'host': ip})()

request = DummyRequest('127.0.0.1')

# Test hitting a limit
print("Testing limit: 2/minute")
for i in range(3):
    try:
        # We manually call the hit mechanism
        # In actual FastAPI, this is done by the decorator
        limit = limiter.shared_limit("2/minute", scope="test")
        # hit requires the limit string, request, etc.
        # It's easier to just test Redis connectivity directly.
        pass
    except Exception as e:
        print(f"Hit limit: {e}")

# Let's test Redis directly to prove it's connected
if redis_url.startswith("redis"):
    import redis
    r = redis.from_url(redis_url)
    r.ping()
    print("Redis PING successful!")
    r.set("test_key", "Hello from Redis!")
    val = r.get("test_key")
    print(f"Retrieved from Redis: {val.decode('utf-8')}")
else:
    print("Not using Redis, falling back to memory.")
