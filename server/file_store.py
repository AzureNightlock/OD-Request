# file_store.py
from typing import Dict, Optional
import time, uuid

FILE_STORE: Dict[str, dict] = {}
FILE_TTL_SECONDS = 60 * 60                  # 1 hour
FILE_STORE_MAX_ITEMS = 200
FILE_STORE_MAX_BYTES = 100 * 1024 * 1024    # 100 MB
_current_bytes = 0

def cleanup_filestore() -> None:
    """Expire by TTL and evict oldest until under quotas."""
    global _current_bytes
    now = time.time()

    # expire by TTL
    for fid in list(FILE_STORE.keys()):
        meta = FILE_STORE[fid]
        if now - meta.get("ts", now) > FILE_TTL_SECONDS:
            _current_bytes -= meta.get("size", 0)
            FILE_STORE.pop(fid, None)

    # enforce quotas (evict oldest)
    if _current_bytes > FILE_STORE_MAX_BYTES or len(FILE_STORE) > FILE_STORE_MAX_ITEMS:
        items = sorted(FILE_STORE.items(), key=lambda kv: kv[1].get("ts", 0))  # oldest first
        for fid, meta in items:
            if _current_bytes <= FILE_STORE_MAX_BYTES and len(FILE_STORE) <= FILE_STORE_MAX_ITEMS:
                break
            _current_bytes -= meta.get("size", 0)
            FILE_STORE.pop(fid, None)

def store_file(filename: Optional[str], content: bytes, mime: str) -> dict:
    """Store and return dict with file_id, filename, size."""
    global _current_bytes
    cleanup_filestore()

    size = len(content or b"")
    if size <= 0:
        raise ValueError("Empty file uploaded.")

    # Try to make room; if still no capacity, raise
    if (_current_bytes + size) > FILE_STORE_MAX_BYTES or len(FILE_STORE) >= FILE_STORE_MAX_ITEMS:
        cleanup_filestore()
        if (_current_bytes + size) > FILE_STORE_MAX_BYTES or len(FILE_STORE) >= FILE_STORE_MAX_ITEMS:
            raise RuntimeError("Upload capacity exceeded. Try again later.")

    file_id = f"upl_{uuid.uuid4().hex[:12]}"
    FILE_STORE[file_id] = {
        "filename": filename or "attachment",
        "bytes": content,
        "mime": mime or "application/octet-stream",
        "size": size,
        "ts": time.time(),
    }
    _current_bytes += size
    return {"file_id": file_id, "filename": filename, "size": size}

def pop_file(file_id: Optional[str]) -> Optional[dict]:
    """Return and remove file meta if exists."""
    global _current_bytes
    if not file_id:
        return None
    meta = FILE_STORE.pop(file_id, None)
    if meta:
        _current_bytes -= meta.get("size", 0)
    return meta
