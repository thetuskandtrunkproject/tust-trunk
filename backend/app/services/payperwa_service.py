import os
import logging
import requests
from fastapi import HTTPException
from app.core.config import settings

logger = logging.getLogger(__name__)

PAYPERWA_API_URL = "https://payperwa.com/api/v1"  # PayPerWA REST API endpoint

def get_channel_config() -> dict:
    """
    Resolves the active PayPerWA channel configuration based on PAYPERWA_ACTIVE_CHANNEL.
    Defaults safely to the existing 'old' channel (+91 94434 60663) for backward-compatibility.
    Target new channel is +91 96778 50663.
    """
    channel = (settings.PAYPERWA_ACTIVE_CHANNEL or "old").strip().lower()
    is_new = channel == "new"

    if is_new:
        api_key = settings.PAYPERWA_NEW_API_KEY or settings.PAYPERWA_API_KEY
        channel_id = settings.PAYPERWA_NEW_CHANNEL_ID or settings.PAYPERWA_CHANNEL_ID
        otp_template = settings.PAYPERWA_OTP_TEMPLATE or "otp_verification1"
        sender_phone = settings.PAYPERWA_NEW_PHONE
    else:
        api_key = settings.PAYPERWA_OLD_API_KEY or settings.PAYPERWA_API_KEY
        channel_id = settings.PAYPERWA_OLD_CHANNEL_ID or settings.PAYPERWA_CHANNEL_ID
        otp_template = settings.PAYPERWA_OTP_TEMPLATE or "otp_verification"
        sender_phone = settings.PAYPERWA_OLD_PHONE

    return {
        "channel": "new" if is_new else "old",
        "api_key": api_key,
        "channel_id": channel_id.strip() if channel_id else "",
        "otp_template": otp_template,
        "sender_phone": sender_phone,
    }

def _send_message(payload: dict) -> bool:
    cfg = get_channel_config()
    api_key = cfg["api_key"]

    if not api_key:
        logger.error(f"PAYPERWA_API_KEY is not set for channel '{cfg['channel']}'.")
        return False

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # Pass X-Channel-Id if multi-channel identifier is configured
    if cfg["channel_id"]:
        headers["X-Channel-Id"] = cfg["channel_id"]

    try:
        response = requests.post(f"{PAYPERWA_API_URL}/messages/send", json=payload, headers=headers)
        if response.status_code in [200, 201]:
            logger.info(f"PayPerWA message sent successfully via channel '{cfg['channel']}'.")
            return True
        else:
            logger.error(f"PayPerWA API error [{cfg['channel']} channel]: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        logger.error(f"Failed to send PayPerWA message [{cfg['channel']} channel]: {e}")
        return False

def send_otp_message(phone: str, otp: str) -> bool:
    """
    Sends OTP via PayPerWA using the channel's approved template:
    - otp_verification on the old channel (+91 94434 60663)
    - otp_verification1 on the new channel (+91 96778 50663)
    """
    cfg = get_channel_config()
    payload = {
        "to": phone.strip().lstrip("+"),
        "template_name": cfg["otp_template"],
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
    template_name = settings.PAYPERWA_ORDER_CONFIRMATION_TEMPLATE or "order_confirmation"
    payload = {
        "to": phone.strip().lstrip("+"),
        "template_name": template_name,
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

    template_name = settings.PAYPERWA_OWNER_ALERT_TEMPLATE or "owner_order_alert"
    payload = {
        "to": settings.OWNER_WHATSAPP_NUMBER.strip().lstrip("+"),
        "template_name": template_name,
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
    template_name = settings.PAYPERWA_ORDER_SHIPPED_TEMPLATE or "order_shipped"
    payload = {
        "to": phone.strip().lstrip("+"),
        "template_name": template_name,
        "language": "en",
        "variables": [customer_name, order_id, items_summary, tracking_number]
    }
    return _send_message(payload)
