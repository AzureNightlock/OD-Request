// utils.js
export const $ = (id) => document.getElementById(id);

export function readableBytes(bytes){
  const units = ["B","KB","MB","GB"];
  let i = 0, n = bytes;
  while(n >= 1024 && i < units.length-1){ n/=1024; i++; }
  return `${n.toFixed(1)} ${units[i]}`;
}

export function setFieldError(input, message){
  const errId = input.getAttribute("aria-describedby");
  const errEl = errId ? document.getElementById(errId) : null;
  const wrapper = input.closest(".field");
  input.setAttribute("aria-invalid", message ? "true" : "false");
  if (wrapper) wrapper.classList.toggle("invalid", !!message);
  if (wrapper && !message) wrapper.classList.remove("invalid");
  if (errEl) errEl.textContent = message || "";
}

export function clearFieldError(input){
  setFieldError(input, "");
}

export function setStatus(el, msg, type="info"){
  if (!el) return;
  el.textContent = msg || "";
  el.style.color = type === "error" ? "var(--error)" :
                   type === "success" ? "var(--ok)" : "inherit";
}

export function setMinDateToday(inputEl){
  if (!inputEl) return;
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth()+1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  inputEl.min = `${yyyy}-${mm}-${dd}`;
}
export function setMaxDateDaysAhead(input, days = 30) {
  if (!input) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const max = new Date(today);
  max.setDate(max.getDate() + days);

  const pad = (n) => String(n).padStart(2, "0");
  const asInput = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  input.max = asInput(max);
}