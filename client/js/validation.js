// validation.js
import { PATTERNS } from "./config.js";
import { setFieldError } from "./utils.js";

export function attachErrorClearHandlers(fields) {
  fields.forEach((el) => {
    if (!el) return;
    el.addEventListener("input", () => setFieldError(el, ""));
    el.addEventListener("change", () => setFieldError(el, ""));
  });
}

export function validate(
  { regno, name, email, course, eventEl, dateEl },
  uploadedFileMeta
) {
  let ok = true;

  // Register number (digits only, 6–15)
  const regVal = regno.value.trim();
  if (!regVal) {
    setFieldError(regno, "Register number is required.");
    ok = false;
  } else if (!PATTERNS.REGNO_RE.test(regVal)) {
    setFieldError(regno, "Use 6-15 digits only.");
    ok = false;
  }

  // Name
  const nameVal = name.value.trim();
  if (!nameVal) {
    setFieldError(name, "Name is required.");
    ok = false;
  } else if (!PATTERNS.NAME_RE.test(nameVal)) {
    setFieldError(name, "Letters and spaces only.");
    ok = false;
  }

  // Email
  if (!email.value.trim()) {
    setFieldError(email, "Email is required.");
    ok = false;
  } else if (!email.checkValidity()) {
    setFieldError(email, "Enter a valid email address.");
    ok = false;
  }

  // Course
  if (!course.value) {
    setFieldError(course, "Please select your programme.");
    ok = false;
  }

  // Event
  if (!eventEl.value.trim()) {
    setFieldError(eventEl, "Event name is required.");
    ok = false;
  }

  // Date (not in the past; not beyond max)
  if (!dateEl.value) {
    setFieldError(dateEl, "Event date is required.");
    ok = false;
  } else {
    // Parse safely in local time
    const selected = new Date(`${dateEl.value}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Past?
    if (selected < today) {
      setFieldError(dateEl, "Event date cannot be in the past.");
      ok = false;
    }

    // Beyond max (if max is set)
    if (ok && dateEl.max) {
      const max = new Date(`${dateEl.max}T00:00:00`);
      if (selected > max) {
        setFieldError(dateEl, "Event date must be within 30 days from today.");
        ok = false;
      }
    }
  }

  // File (2-step upload: require server-generated file_id)
  const fileError = document.getElementById("file-error");
  if (!uploadedFileMeta?.file_id) {
    if (fileError)
      fileError.textContent =
        "Please upload proof (PDF/JPG/PNG/WEBP, ≤ 10 MB).";
    ok = false;
  } else if (fileError) {
    fileError.textContent = "";
  }

  return ok;
}
