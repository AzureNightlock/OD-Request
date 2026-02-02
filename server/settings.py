# settings.py
ALLOWED_ORIGINS = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
]

# Upload rules
ALLOWED_MIME = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
}
MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB

# OD policy
OD_DATE_MAX_DAYS = 30  # keep in sync with your frontend
RECEIVER_EMAIL = "aaronjoanajohn@gmail.com"  # staff inbox (change in prod)

# Email/banner
BANNER_PATH = "assets/email-banner.png"  # optional; safe if missing
BRAND_HEX = "#821238"             # masthead color in the HTML email
