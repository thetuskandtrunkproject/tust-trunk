import os
import sys
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.environ.get("PAYPERWA_API_KEY", "ppw_live_sk_eab99b79bc795e09223fe45a259a9a44")
API_URL = "https://payperwa.com/api/v1"

def test_endpoint(endpoint, payload):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    url = f"{API_URL}{endpoint}"
    print(f"Testing {url} with {payload}")
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    return response.status_code

if __name__ == "__main__":
    phone = "919443460663" # Test with owner number
    otp = "123456"
    
    # Try payload 1 (Meta standard)
    payload1 = {
        "to": phone,
        "type": "template",
        "template": {
            "name": "otp_verification",
            "language": {"code": "en"},
            "components": [
                {
                    "type": "body",
                    "parameters": [{"type": "text", "text": otp}]
                },
                {
                    "type": "button",
                    "sub_type": "url",
                    "index": "0",
                    "parameters": [{"type": "text", "text": otp}]
                }
            ]
        }
    }
    
    # Try payload 2 (From search result)
    payload2 = {
        "phone": phone,
        "type": "template",
        "template": {
            "name": "otp_verification",
            "language": "en",
            "components": [
                {
                    "type": "body",
                    "parameters": [{"type": "text", "text": otp}]
                }
            ]
        }
    }

    print("--- Test 1: /messages/send with Payload 1 ---")
    test_endpoint("/messages/send", payload1)
    
    print("\n--- Test 2: /messages/send with Payload 2 ---")
    test_endpoint("/messages/send", payload2)
