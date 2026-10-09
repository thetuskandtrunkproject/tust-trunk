import os
import sys
import requests

API_KEY = os.environ.get("PAYPERWA_API_KEY", "ppw_live_sk_eab99b79bc795e09223fe45a259a9a44")
API_URL = "https://payperwa.com/api/v1/messages/send"

def test_payload(payload):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    response = requests.post(API_URL, json=payload, headers=headers)
    print(f"Payload: {payload}")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    print("-" * 50)

if __name__ == "__main__":
    phone = "919443460663"
    otp = "123456"
    
    # Payload 3: Flat structure
    payload3 = {
        "to": phone,
        "type": "template",
        "template_name": "otp_verification",
        "language_code": "en",
        "components": [
            {
                "type": "body",
                "parameters": [{"type": "text", "text": otp}]
            }
        ]
    }
    
    # Payload 4: Maybe parameters directly?
    payload4 = {
        "to": phone,
        "type": "template",
        "template_name": "otp_verification",
        "language": "en",
        "parameters": [otp]
    }
    
    # Payload 5: Just to and template_name
    payload5 = {
        "to": phone,
        "template_name": "otp_verification"
    }
    
    test_payload(payload3)
    test_payload(payload4)
    test_payload(payload5)
