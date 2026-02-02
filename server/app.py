# app.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from datetime import datetime, timedelta
import uuid, os

from settings import (
    ALLOWED_ORIGINS, ALLOWED_MIME, MAX_FILE_BYTES,
    OD_DATE_MAX_DAYS, RECEIVER_EMAIL, BRAND_HEX
)
from schemas import ODRequest
from file_store import store_file, pop_file
from email_templates import render_od_email
from email_sender import send_email

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://([a-zA-Z0-9\.-]+|\d{1,3}(?:\.\d{1,3}){3}):5500$",
    allow_credentials=False,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

@app.post("/upload/")
async def upload(file: UploadFile = File(...)):
    # validate basic mime
    mime = (file.content_type or "").lower()
    if mime not in ALLOWED_MIME:
        raise HTTPException(status_code=415, detail="Unsupported file type.")
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    if len(content) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB).")

    try:
        result = store_file(file.filename, content, mime)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    return result  # {file_id, filename, size}
@app.post("/api/v1/od-requests")
async def create_od_request(payload: ODRequest):
    # Event date window (authoritative)
    today = datetime.now().date()
    max_window = today + timedelta(days=OD_DATE_MAX_DAYS)
    if payload.od.date < today:
        raise HTTPException(status_code=400, detail="Event date cannot be in the past.")
    if payload.od.date > max_window:
        raise HTTPException(status_code=400, detail=f"Event date must be within {OD_DATE_MAX_DAYS} days from today.")

    # get uploaded proof (if any) by file_id
    meta = pop_file(payload.od.proof_file_id)

    subject, text_body, html_body = render_od_email(payload, has_proof=bool(meta), brand_hex=BRAND_HEX)


    # send mail
    send_email(
        receiver=RECEIVER_EMAIL,
        subject=subject,
        body=text_body,
        filename=(meta["filename"] if meta else None),
        bytes_content=(meta["bytes"] if meta else None),
        mime=(meta["mime"] if meta else None),
        reply_to=payload.student.email,
        html_body=html_body,
    )

    # return a small receipt
    return {"ok": True, "id": uuid.uuid4().hex}
