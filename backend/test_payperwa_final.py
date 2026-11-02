import os
import requests

API_KEY = os.environ.get("PAYPERWA_API_KEY", "")
API_URL = "https://payperwa.com/api/v1/messages/send"

def run_manual_test():
    if not API_KEY:
        print("PAYPERWA_API_KEY environment variable is not set.")
        return

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
    run_manual_test()
