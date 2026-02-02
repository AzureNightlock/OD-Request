# email_sender.py
from email.message import EmailMessage
from dotenv import load_dotenv

import os, smtplib, mimetypes

load_dotenv()

def _as_bool(v: str, default=False) -> bool:
    if v is None:
        return default
    return str(v).strip().lower() in ("1", "true", "yes", "y", "on")

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))   # 465 SSL (default), or set 587 + SMTP_USE_STARTTLS=1
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
USE_STARTTLS = _as_bool(os.getenv("SMTP_USE_STARTTLS"), default=False)
FROM = os.getenv("FROM_EMAIL", SMTP_USER or "")

if not SMTP_USER or not SMTP_PASS:
    raise RuntimeError("SMTP_USER / SMTP_PASS are not set. Check your .env or environment.")


def send_email(
    receiver,
    subject,
    body,
    filename=None,
    bytes_content=None,
    mime=None,
    reply_to=None,
    html_body=None,
):
    # recipients
    recipients = [r.strip() for r in ([receiver] if isinstance(receiver, str) else (receiver or [])) if r.strip()]
    if not recipients:
        raise ValueError("No recipients specified")

    msg = EmailMessage()
    msg["From"] = FROM or SMTP_USER or ""
    msg["To"] = ", ".join(recipients)
    msg["Subject"] = subject.strip()
    if reply_to:
        msg["Reply-To"] = reply_to

    # 1) plain text
    msg.set_content(body or "")

    # 2) optional HTML + inline banner
    if html_body:
        msg.add_alternative(html_body, subtype="html")

    # 3) attachment (proof)
    if bytes_content is not None:
        if not mime:
            guessed, _ = mimetypes.guess_type(filename or "")
            mime = guessed or "application/octet-stream"
        maintype, subtype = (mime.split("/", 1) if "/" in mime else ("application", "octet-stream"))
        safe_name = (filename or "attachment.bin").replace("\\", "_").replace("/", "_")
        msg.add_attachment(bytes(bytes_content), maintype=maintype, subtype=subtype, filename=safe_name)

    # 4) send
    if USE_STARTTLS:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT or 587) as s:
            s.ehlo(); s.starttls(); s.login(SMTP_USER, SMTP_PASS); s.send_message(msg)
    else:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as s:
            s.login(SMTP_USER, SMTP_PASS); s.send_message(msg)
