import os
import logging
import requests
from fastapi import HTTPException
from app.core.config import settings

logger = logging.getLogger(__name__)

PAYPERWA_API_URL = "https://payperwa.com/api/v1" # Correct API URL

def _send_message(payload: dict) -> bool:
    if not settings.PAYPERWA_API_KEY:
        logger.error("PAYPERWA_API_KEY is not set.")
        return False

    headers = {
        "Authorization": f"Bearer {settings.PAYPERWA_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(f"{PAYPERWA_API_URL}/messages/send", json=payload, headers=headers)
        if response.status_code in [200, 201]:
            return True
        else:
            logger.error(f"PayPerWA API error: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        logger.error(f"Failed to send PayPerWA message: {e}")
        return False

def send_otp_message(phone: str, otp: str) -> bool:
    """
    Sends OTP via PayPerWA using the otp_verification template.
    """
    payload = {
        "to": phone.lstrip("+"),
        "template_name": "otp_verification",
        "language": "en",
        "variables": [otp]
    }
    return _send_message(payload)

def send_order_confirmation(phone: str, order_id: str, amount: str) -> bool:
    """
    Sends order confirmation via PayPerWA using the order_confirmation template.
    """
    payload = {
        "to": phone.lstrip("+"),
        "template_name": "order_confirmation",
        "language": "en",
        "variables": [order_id, amount]
    }
    return _send_message(payload)

def send_owner_order_alert(order_id: str, customer_name: str, amount: str) -> bool:
    """
    Sends order alert to owner via PayPerWA using the owner_order_alert template.
    """
    if not settings.OWNER_WHATSAPP_NUMBER:
        logger.warning("OWNER_WHATSAPP_NUMBER is not set, skipping owner alert.")
        return False

    payload = {
        "to": settings.OWNER_WHATSAPP_NUMBER.lstrip("+"),
        "template_name": "owner_order_alert",
        "language": "en",
        "variables": [order_id, customer_name, amount]
    }
    return _send_message(payload)
