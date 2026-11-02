import os
import sys
import argparse
import requests
from dotenv import load_dotenv

# Load local .env
load_dotenv()

# Ensure 'backend' is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.services import payperwa_service

def inspect_connected_channels():
    """Queries PayPerWA GET /channels to inspect connected numbers and channel IDs."""
    cfg = payperwa_service.get_channel_config()
    api_key = cfg["api_key"]

    if not api_key:
        print("\n[ERROR] No PayPerWA API key found in settings or environment variables.")
        print("Please configure PAYPERWA_NEW_API_KEY (or PAYPERWA_API_KEY) in backend/.env.")
        return

    print(f"\n--- PayPerWA Channel Discovery ---")
    print(f"Active Channel Mode: {cfg['channel']}")
    print(f"Sender Phone: {cfg['sender_phone']}")
    print(f"Querying https://payperwa.com/api/v1/channels ...")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    try:
        res = requests.get(f"{payperwa_service.PAYPERWA_API_URL}/channels", headers=headers, timeout=10)
        print(f"HTTP Status: {res.status_code}")
        if res.status_code == 200:
            print(f"Connected Channels Response:\n{res.text}")
        else:
            print(f"Failed to query channels: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"Error querying channels: {e}")

def run_safe_live_test(phone: str, flow: str, confirm: bool):
    cfg = payperwa_service.get_channel_config()
    api_key = cfg["api_key"]

    if not api_key:
        print("\n[ERROR] No PayPerWA API key configured.")
        print(f"Please set PAYPERWA_NEW_API_KEY in backend/.env for channel '{cfg['channel']}'.")
        return

    clean_phone = phone.strip().lstrip("+")
    print("\n" + "=" * 60)
    print(" PAYPERWA SAFE LOCAL LIVE TEST ")
    print("=" * 60)
    print(f"Active Target Channel : {cfg['channel'].upper()}")
    print(f"Target Sender Phone   : {cfg['sender_phone']}")
    print(f"Channel ID Header     : {cfg['channel_id'] or '(none - default)'}")
    print(f"Recipient Test Phone  : {clean_phone}")
    print(f"Flow(s) To Test       : {flow}")
    print(f"OTP Template In Use   : {cfg['otp_template']}")
    print("=" * 60)

    if not confirm:
        print("\n[SAFETY NOTICE] This will send a REAL WhatsApp message to the test recipient.")
        proceed = input(f"Are you sure you want to send test message(s) to +{clean_phone}? (yes/no): ").strip().lower()
        if proceed not in ["yes", "y"]:
            print("Test aborted. No messages sent.")
            return

    results = {}

    if flow in ["otp", "all"]:
        test_otp = "123456"
        print(f"\n[1/4] Testing OTP Verification (Template: {cfg['otp_template']}) ...")
        res = payperwa_service.send_otp_message(clean_phone, test_otp)
        results["otp"] = res
        print(f"      Result: {'SUCCESS' if res else 'FAILED'}")

    if flow in ["order_confirmation", "all"]:
        print(f"\n[2/4] Testing Customer Order Confirmation (Template: {settings.PAYPERWA_ORDER_CONFIRMATION_TEMPLATE}) ...")
        res = payperwa_service.send_order_confirmation(
            phone=clean_phone,
            customer_name="Test Recipient",
            order_id="TEST-ORD-001",
            items_summary="Test Shirt (L) x 1",
            amount="1"
        )
        results["order_confirmation"] = res
        print(f"      Result: {'SUCCESS' if res else 'FAILED'}")

    if flow in ["owner_order_alert", "all"]:
        print(f"\n[3/4] Testing Owner Order Alert (Template: {settings.PAYPERWA_OWNER_ALERT_TEMPLATE}) ...")
        # Temporarily use clean_phone as OWNER_WHATSAPP_NUMBER for test safety if not set
        original_owner = settings.OWNER_WHATSAPP_NUMBER
        if not settings.OWNER_WHATSAPP_NUMBER:
            settings.OWNER_WHATSAPP_NUMBER = clean_phone
            print(f"      [Notice] Using test phone {clean_phone} as temporary owner alert recipient.")

        res = payperwa_service.send_owner_order_alert(
            order_id="TEST-ORD-001",
            customer_name="Test Customer",
            amount="1",
            items_summary="Test Shirt (L) x 1",
            payment_status="Test-Paid"
        )
        settings.OWNER_WHATSAPP_NUMBER = original_owner
        results["owner_order_alert"] = res
        print(f"      Result: {'SUCCESS' if res else 'FAILED'}")

    if flow in ["order_shipped", "all"]:
        print(f"\n[4/4] Testing Order Shipped Notification (Template: {settings.PAYPERWA_ORDER_SHIPPED_TEMPLATE}) ...")
        res = payperwa_service.send_order_shipped(
            phone=clean_phone,
            customer_name="Test Recipient",
            order_id="TEST-ORD-001",
            items_summary="Test Shirt (L) x 1",
            tracking_number="ST-TEST-123456"
        )
        results["order_shipped"] = res
        print(f"      Result: {'SUCCESS' if res else 'FAILED'}")

    print("\n" + "=" * 60)
    print(" TEST SUMMARY")
    print("=" * 60)
    for k, v in results.items():
        print(f" - {k.ljust(25)}: {'SUCCESS' if v else 'FAILED'}")
    print("=" * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PayPerWA Safe Local Live Channel Test Runner")
    parser.add_argument("phone", nargs="?", help="Authorized test recipient phone number (e.g. +919876543210)")
    parser.add_argument("--flow", choices=["otp", "order_confirmation", "owner_order_alert", "order_shipped", "all", "inspect_channels"], default="otp", help="Message flow to test (default: otp)")
    parser.add_argument("--confirm", action="store_true", help="Skip interactive confirmation prompt")
    parser.add_argument("--inspect-channels", action="store_true", help="Inspect connected channels from PayPerWA API")

    args = parser.parse_args()

    if args.inspect_channels or args.flow == "inspect_channels":
        inspect_connected_channels()
    elif not args.phone:
        print("Usage: python backend/test_channel_live.py <authorized_test_phone> [--flow otp|order_confirmation|owner_order_alert|order_shipped|all]")
        print("   Or: python backend/test_channel_live.py --inspect-channels")
        sys.exit(1)
    else:
        run_safe_live_test(args.phone, args.flow, args.confirm)
