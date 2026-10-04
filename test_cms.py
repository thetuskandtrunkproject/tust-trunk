import requests
import json

# We'll just call the public GET endpoint, modify it, and PUT it back.
# We need to authenticate as admin.
# Let's see if we can just get the error from the server directly.

res = requests.get('http://127.0.0.1:8000/public/categories')
print(res.status_code)
