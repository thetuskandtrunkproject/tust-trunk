import pytest
from unittest.mock import patch, MagicMock
from app.core.config import settings
from app.services import payperwa_service

@pytest.fixture(autouse=True)
def reset_settings():
    """Reset settings between tests to guarantee clean isolation."""
    original_channel = settings.PAYPERWA_ACTIVE_CHANNEL
    original_api_key = settings.PAYPERWA_API_KEY
    original_old_key = settings.PAYPERWA_OLD_API_KEY
    original_new_key = settings.PAYPERWA_NEW_API_KEY
    original_channel_id = settings.PAYPERWA_CHANNEL_ID
    original_old_ch_id = settings.PAYPERWA_OLD_CHANNEL_ID
    original_new_ch_id = settings.PAYPERWA_NEW_CHANNEL_ID
    original_owner_num = settings.OWNER_WHATSAPP_NUMBER
    original_otp_tmpl = settings.PAYPERWA_OTP_TEMPLATE

    yield

    settings.PAYPERWA_ACTIVE_CHANNEL = original_channel
    settings.PAYPERWA_API_KEY = original_api_key
    settings.PAYPERWA_OLD_API_KEY = original_old_key
    settings.PAYPERWA_NEW_API_KEY = original_new_key
    settings.PAYPERWA_CHANNEL_ID = original_channel_id
    settings.PAYPERWA_OLD_CHANNEL_ID = original_old_ch_id
    settings.PAYPERWA_NEW_CHANNEL_ID = original_new_ch_id
    settings.OWNER_WHATSAPP_NUMBER = original_owner_num
    settings.PAYPERWA_OTP_TEMPLATE = original_otp_tmpl


# ==============================================================================
# Flow 1: Customer OTP Verification Tests
# ==============================================================================

def test_old_channel_otp_uses_otp_verification():
    """Verify that the old channel (+91 94434 60663) sends the approved 'otp_verification' template."""
    settings.PAYPERWA_ACTIVE_CHANNEL = "old"
    settings.PAYPERWA_OLD_API_KEY = "test_old_secret_key"
    settings.PAYPERWA_NEW_API_KEY = "test_new_secret_key"
    settings.PAYPERWA_OTP_TEMPLATE = ""

    mock_resp = MagicMock()
    mock_resp.status_code = 200

    with patch("requests.post", return_value=mock_resp) as mock_post:
        success = payperwa_service.send_otp_message("+919443460663", "849201")

        assert success is True
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        assert args[0] == "https://payperwa.com/api/v1/messages/send"
        assert kwargs["headers"]["Authorization"] == "Bearer test_old_secret_key"
        assert kwargs["json"] == {
            "to": "919443460663",
            "template_name": "otp_verification",
            "language": "en",
            "variables": ["849201"]
        }


def test_new_channel_otp_uses_otp_verification1():
    """Verify that the new channel (+91 96778 50663) sends the approved 'otp_verification1' template."""
    settings.PAYPERWA_ACTIVE_CHANNEL = "new"
    settings.PAYPERWA_OLD_API_KEY = "test_old_secret_key"
    settings.PAYPERWA_NEW_API_KEY = "test_new_secret_key"
    settings.PAYPERWA_OTP_TEMPLATE = ""

    mock_resp = MagicMock()
    mock_resp.status_code = 200

    with patch("requests.post", return_value=mock_resp) as mock_post:
        success = payperwa_service.send_otp_message("+919677850663", "654321")

        assert success is True
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        assert args[0] == "https://payperwa.com/api/v1/messages/send"
        assert kwargs["headers"]["Authorization"] == "Bearer test_new_secret_key"
        assert kwargs["json"] == {
            "to": "919677850663",
            "template_name": "otp_verification1",
            "language": "en",
            "variables": ["654321"]
        }


def test_backward_compatible_fallback_api_key():
    """Verify that PAYPERWA_API_KEY acts as fallback when channel-specific key is not set."""
    settings.PAYPERWA_ACTIVE_CHANNEL = "new"
    settings.PAYPERWA_NEW_API_KEY = ""
    settings.PAYPERWA_API_KEY = "global_fallback_key"

    mock_resp = MagicMock()
    mock_resp.status_code = 200

    with patch("requests.post", return_value=mock_resp) as mock_post:
        success = payperwa_service.send_otp_message("9876543210", "111222")
        assert success is True
        assert mock_post.call_args[1]["headers"]["Authorization"] == "Bearer global_fallback_key"


# ==============================================================================
# Flow 2: Customer Order Confirmation Tests
# ==============================================================================

def test_order_confirmation_payload_and_variable_ordering():
    """
    Verify customer order confirmation uses 'order_confirmation' with exact parameter ordering:
    [customer_name, order_id, items_summary, amount]
    """
    settings.PAYPERWA_ACTIVE_CHANNEL = "new"
    settings.PAYPERWA_NEW_API_KEY = "test_key"

    mock_resp = MagicMock()
    mock_resp.status_code = 200

    with patch("requests.post", return_value=mock_resp) as mock_post:
        success = payperwa_service.send_order_confirmation(
            phone="+919876543210",
            customer_name="Ramesh Kumar",
            order_id="TNT-2026-0042",
            items_summary="Classic Polo (L) x 1, Chino Trouser (32) x 1",
            amount="2499"
        )

        assert success is True
        mock_post.assert_called_once()
        payload = mock_post.call_args[1]["json"]
        assert payload["to"] == "919876543210"
        assert payload["template_name"] == "order_confirmation"
        assert payload["language"] == "en"
        assert payload["variables"] == [
            "Ramesh Kumar",
            "TNT-2026-0042",
            "Classic Polo (L) x 1, Chino Trouser (32) x 1",
            "2499"
        ]


# ==============================================================================
# Flow 3: Owner Order Alert Tests
# ==============================================================================

def test_owner_order_alert_payload_and_variable_ordering():
    """
    Verify owner alert uses 'owner_order_alert' with exact parameter ordering:
    [order_id, customer_name, amount, items_summary, payment_status]
    """
    settings.PAYPERWA_ACTIVE_CHANNEL = "new"
    settings.PAYPERWA_NEW_API_KEY = "test_key"
    settings.OWNER_WHATSAPP_NUMBER = "+919677850663"

    mock_resp = MagicMock()
    mock_resp.status_code = 200

    with patch("requests.post", return_value=mock_resp) as mock_post:
        success = payperwa_service.send_owner_order_alert(
            order_id="TNT-2026-0042",
            customer_name="Ramesh Kumar",
            amount="2499",
            items_summary="Classic Polo (L) x 1",
            payment_status="Paid"
        )

        assert success is True
        mock_post.assert_called_once()
        payload = mock_post.call_args[1]["json"]
        assert payload["to"] == "919677850663"
        assert payload["template_name"] == "owner_order_alert"
        assert payload["language"] == "en"
        assert payload["variables"] == [
            "TNT-2026-0042",
            "Ramesh Kumar",
            "2499",
            "Classic Polo (L) x 1",
            "Paid"
        ]


def test_owner_order_alert_skipped_when_no_owner_number():
    """Verify owner alert skips cleanly without making an HTTP request when OWNER_WHATSAPP_NUMBER is empty."""
    settings.OWNER_WHATSAPP_NUMBER = ""
    settings.PAYPERWA_ACTIVE_CHANNEL = "new"
    settings.PAYPERWA_NEW_API_KEY = "test_key"

    with patch("requests.post") as mock_post:
        success = payperwa_service.send_owner_order_alert(
            order_id="TNT-2026-0042",
            customer_name="Ramesh Kumar",
            amount="2499",
            items_summary="Classic Polo (L) x 1",
            payment_status="Paid"
        )
        assert success is False
        mock_post.assert_not_called()


# ==============================================================================
# Flow 4: Order Shipped Shipping Notification Tests
# ==============================================================================

def test_order_shipped_payload_and_variable_ordering():
    """
    Verify shipping notification uses 'order_shipped' with exact parameter ordering:
    [customer_name, order_id, items_summary, tracking_number]
    """
    settings.PAYPERWA_ACTIVE_CHANNEL = "new"
    settings.PAYPERWA_NEW_API_KEY = "test_key"

    mock_resp = MagicMock()
    mock_resp.status_code = 200

    with patch("requests.post", return_value=mock_resp) as mock_post:
        success = payperwa_service.send_order_shipped(
            phone="+919876543210",
            customer_name="Ramesh Kumar",
            order_id="TNT-2026-0042",
            items_summary="Classic Polo (L) x 1",
            tracking_number="ST109283746IN"
        )

        assert success is True
        mock_post.assert_called_once()
        payload = mock_post.call_args[1]["json"]
        assert payload["to"] == "919876543210"
        assert payload["template_name"] == "order_shipped"
        assert payload["language"] == "en"
        assert payload["variables"] == [
            "Ramesh Kumar",
            "TNT-2026-0042",
            "Classic Polo (L) x 1",
            "ST109283746IN"
        ]


# ==============================================================================
# Error Handling, Edge Cases, and Configuration Overrides
# ==============================================================================

def test_missing_api_key_returns_false_safely():
    """Verify that an unset API key returns False without raising unhandled exceptions or making HTTP calls."""
    settings.PAYPERWA_ACTIVE_CHANNEL = "old"
    settings.PAYPERWA_API_KEY = ""
    settings.PAYPERWA_OLD_API_KEY = ""

    with patch("requests.post") as mock_post:
        success = payperwa_service.send_otp_message("+919876543210", "123456")
        assert success is False
        mock_post.assert_not_called()


def test_api_upstream_error_response_handled_gracefully():
    """Verify that 4xx / 5xx HTTP responses are handled safely and return False."""
    settings.PAYPERWA_ACTIVE_CHANNEL = "new"
    settings.PAYPERWA_NEW_API_KEY = "test_key"

    mock_resp = MagicMock()
    mock_resp.status_code = 400
    mock_resp.text = '{"error": "Invalid recipient phone number"}'

    with patch("requests.post", return_value=mock_resp):
        success = payperwa_service.send_otp_message("+910000000000", "123456")
        assert success is False


def test_network_exception_handled_gracefully():
    """Verify that unexpected connection drop or timeout returns False without crashing the caller."""
    import requests
    settings.PAYPERWA_ACTIVE_CHANNEL = "new"
    settings.PAYPERWA_NEW_API_KEY = "test_key"

    with patch("requests.post", side_effect=requests.exceptions.ConnectTimeout("Connection timed out")):
        success = payperwa_service.send_otp_message("+919876543210", "123456")
        assert success is False


def test_custom_otp_template_override():
    """Verify that setting PAYPERWA_OTP_TEMPLATE explicitly overrides the channel default."""
    settings.PAYPERWA_ACTIVE_CHANNEL = "new"
    settings.PAYPERWA_NEW_API_KEY = "test_key"
    settings.PAYPERWA_OTP_TEMPLATE = "custom_otp_promo"

    mock_resp = MagicMock()
    mock_resp.status_code = 200

    with patch("requests.post", return_value=mock_resp) as mock_post:
        success = payperwa_service.send_otp_message("+919876543210", "999888")
        assert success is True
        assert mock_post.call_args[1]["json"]["template_name"] == "custom_otp_promo"


def test_x_channel_id_header_included_when_configured():
    """Verify that X-Channel-Id header is added when PAYPERWA_NEW_CHANNEL_ID is set."""
    settings.PAYPERWA_ACTIVE_CHANNEL = "new"
    settings.PAYPERWA_NEW_API_KEY = "test_key"
    settings.PAYPERWA_NEW_CHANNEL_ID = "3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90"

    mock_resp = MagicMock()
    mock_resp.status_code = 200

    with patch("requests.post", return_value=mock_resp) as mock_post:
        success = payperwa_service.send_otp_message("+919876543210", "123456")
        assert success is True
        headers = mock_post.call_args[1]["headers"]
        assert headers["X-Channel-Id"] == "3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90"


def test_x_channel_id_header_omitted_when_not_configured():
    """Verify that X-Channel-Id header is not included when channel ID is blank."""
    settings.PAYPERWA_ACTIVE_CHANNEL = "new"
    settings.PAYPERWA_NEW_API_KEY = "test_key"
    settings.PAYPERWA_NEW_CHANNEL_ID = ""
    settings.PAYPERWA_CHANNEL_ID = ""

    mock_resp = MagicMock()
    mock_resp.status_code = 200

    with patch("requests.post", return_value=mock_resp) as mock_post:
        success = payperwa_service.send_otp_message("+919876543210", "123456")
        assert success is True
        headers = mock_post.call_args[1]["headers"]
        assert "X-Channel-Id" not in headers
