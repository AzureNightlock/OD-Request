// config.js
const API_HOST = window.location.hostname; // works for localhost or LAN IP
const API_PORT = 8000;
const API_BASE = `${location.protocol}//${API_HOST}:${API_PORT}`;

export const ENDPOINTS = {
  UPLOAD_URL: `${API_BASE}/upload/`,
  OD_REQUESTS_URL: `${API_BASE}/api/v1/od-requests`,
};

export const LIMITS = {
  MAX_FILE_BYTES: 10 * 1024 * 1024, // 10 MB
  ALLOWED_TYPES: ["application/pdf", "image/png", "image/jpeg", "image/webp"],
};

export const PATTERNS = {
  REGNO_RE: /^\d{6,15}$/, // digits only, length 6–15
  NAME_RE: /^[A-Za-z\s]+$/, // letters + spaces only
};
