import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# We need to make sure 'app' is in the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.payperwa_service import send_otp_message

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_otp.py <phone_number>")
        print("Example: python test_otp.py +919876543210")
        sys.exit(1)
        
    phone = sys.argv[1]
    otp = "123456"
    print(f"Sending test OTP {otp} to {phone}...")
    
    success = send_otp_message(phone, otp)
    if success:
        print("Successfully sent OTP!")
    else:
        print("Failed to send OTP. Check the logs for more details.")
