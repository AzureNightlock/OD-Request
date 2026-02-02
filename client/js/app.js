// app.js
import { ENDPOINTS } from "./config.js";
import {
  $,
  setStatus,
  clearFieldError,
  setMinDateToday,
  setMaxDateDaysAhead,
} from "./utils.js";
import { initDropzone } from "./upload.js";
import { validate, attachErrorClearHandlers } from "./validation.js";
import { postJson } from "./api.js";

window.addEventListener("DOMContentLoaded", () => {
  const form = $("od-form");
  const statusEl = $("form-status");
  const submitBtn = $("submit-btn");
  const regno = $("regno");
  const name = $("name");
  const email = $("email");
  const course = $("course");
  const eventEl = $("event");
  const dateEl = $("date");

  // Upload UI
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const fileHint = document.getElementById("file-hint");
  const fileError = document.getElementById("file-error");
  const hiddenFileId = document.getElementById("file-id");

  // Keep success banner when we reset programmatically after submit
  let suppressStatusOnReset = false;

  // Min/max date (today .. +30 days)
  setMinDateToday(dateEl);
  setMaxDateDaysAhead(dateEl, 30);

  // Soft reset: run *after* the browser's native reset so fields are cleared
  form?.addEventListener("reset", () => {
    setTimeout(() => {
      // 1) Clear the dropzone state & hidden file_id
      uploader?.clear();

      // 2) Clear field-level errors/borders
      [regno, name, email, course, eventEl, dateEl].forEach(clearFieldError);

      // 3) Re-enable submit (in case it was disabled)
      submitBtn.disabled = false;

      // 4) Only clear the status if this was a user-initiated reset
      if (!suppressStatusOnReset) setStatus(statusEl, "");

      // Always release the guard
      suppressStatusOnReset = false;
    }, 0);
  });

  // Clear errors on user edits
  attachErrorClearHandlers([regno, name, email, course, eventEl, dateEl]);

  const uploader = initDropzone({
    dropZone,
    fileInput,
    fileHint,
    fileError,
    hiddenFileId,
    uploadUrl: ENDPOINTS.UPLOAD_URL,
  });

  function serialize(uploadedMeta) {
    return {
      student: {
        regno: regno.value.trim(),
        name: name.value.trim(),
        email: email.value.trim(),
        course: course.value,
      },
      od: {
        event: eventEl.value.trim(),
        date: dateEl.value,
        proof_file_id: uploadedMeta?.file_id || null,
      },
    };
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault(); // don't navigate/reload
    setStatus(statusEl, "");
    [regno, name, email, course, eventEl, dateEl].forEach(clearFieldError);

    const ok = validate(
      { regno, name, email, course, eventEl, dateEl },
      uploader.getMeta()
    );
    if (!ok) {
      setStatus(statusEl, "Please fix the highlighted fields.", "error");
      return; // IMPORTANT: do not disable button if validation fails
    }

    const payload = serialize(uploader.getMeta());
    submitBtn.disabled = true; // disable only now
    setStatus(
      statusEl,
      "Submitting… large attachments can take a few seconds.",
      "info"
    );

    try {
      await postJson(ENDPOINTS.OD_REQUESTS_URL, payload);

      setStatus(statusEl, "Request submitted successfully!", "success");

      // Programmatic soft reset — KEEP the success banner
      suppressStatusOnReset = true;
      form.reset(); // reset handler will clear inputs & uploader
    } catch (err) {
      const msg = err?.message || "Failed to submit request.";
      setStatus(statusEl, msg, "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
});
