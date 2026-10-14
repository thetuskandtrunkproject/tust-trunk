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
        "to": phone.strip().lstrip("+"),
        "template_name": "otp_verification",
        "language": "en",
        "variables": [otp]
    }
    return _send_message(payload)

def send_order_confirmation(phone: str, customer_name: str, order_id: str, items_summary: str, amount: str) -> bool:
    """
    Sends order confirmation via PayPerWA using the approved order_confirmation template:
    Hi {{1}}, thank you for shopping with The Tusk & Trunk!
    Your order #{{2}} has been placed successfully.
    Product: {{3}} Amount: ₹{{4}}
    """
    payload = {
        "to": phone.strip().lstrip("+"),
        "template_name": "order_confirmation",
        "language": "en",
        "variables": [customer_name, order_id, items_summary, amount]
    }
    return _send_message(payload)

def send_owner_order_alert(order_id: str, customer_name: str, amount: str, items_summary: str, payment_status: str = "Paid") -> bool:
    """
    Sends order alert to owner via PayPerWA using the approved owner_order_alert template:
    A new order has been received. Order ID: #{{1}}
    Customer: {{2}} Amount: ₹{{3}} Items: {{4}} Payment Status: {{5}}
    """
    if not settings.OWNER_WHATSAPP_NUMBER:
        logger.warning("OWNER_WHATSAPP_NUMBER is not set, skipping owner alert.")
        return False

    payload = {
        "to": settings.OWNER_WHATSAPP_NUMBER.strip().lstrip("+"),
        "template_name": "owner_order_alert",
        "language": "en",
        "variables": [order_id, customer_name, amount, items_summary, payment_status]
    }
    return _send_message(payload)

def send_order_shipped(phone: str, customer_name: str, order_id: str, items_summary: str, tracking_number: str) -> bool:
    """
    Sends shipping update via PayPerWA using order_shipped template:
    Hi {{1}}, your order #{{2}} has been shipped via ST Courier!
    Items: {{3}} Tracking No: {{4}}
    """
    payload = {
        "to": phone.strip().lstrip("+"),
        "template_name": "order_shipped",
        "language": "en",
        "variables": [customer_name, order_id, items_summary, tracking_number]
    }
    return _send_message(payload)
