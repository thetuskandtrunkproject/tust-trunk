import os
import requests

API_KEY = os.environ.get("PAYPERWA_API_KEY", "ppw_live_sk_eab99b79bc795e09223fe45a259a9a44")
API_URL = "https://payperwa.com/api/v1/messages/send"

def test():
    otp = "123456"
    payload = {
        "to": "919443460663",
        "template_name": "otp_verification",
        "language": "en",
        "components": [
            {
                "type": "body",
                "parameters": [
                    {
                        "type": "text",
                        "text": otp
                    }
                ]
            },
            {
                "type": "button",
                "sub_type": "url",
                "index": "0",
                "parameters": [
                    {
                        "type": "text",
                        "text": otp
                    }
                ]
            }
        ]
    }
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    print(f"Testing {API_URL} with payload")
    response = requests.post(API_URL, json=payload, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test()
