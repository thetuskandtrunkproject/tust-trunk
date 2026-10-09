import os
import requests

API_KEY = os.environ.get("PAYPERWA_API_KEY", "ppw_live_sk_eab99b79bc795e09223fe45a259a9a44")
API_URL = "https://payperwa.com/api/v1/messages/send"

def test():
    payload = {
        "to": "919443460663",
        "template_name": "otp_verification",
        "language": "en",
        "variables": ["123456"]
    }
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    print(f"Testing {API_URL} with payload {payload}")
    response = requests.post(API_URL, json=payload, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test()
