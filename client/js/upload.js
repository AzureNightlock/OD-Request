// upload.js
import { readableBytes } from "./utils.js";
import { uploadFile } from "./api.js";
import { LIMITS } from "./config.js";

export function initDropzone({ dropZone, fileInput, fileHint, fileError, hiddenFileId, uploadUrl }){
  let uploadedFileMeta = null;

  function setFileError(msg){
    if (fileError) fileError.textContent = msg || "";
    if (dropZone) dropZone.classList.toggle("invalid", !!msg);
  }

  function clearFileUI() {
    // in-memory state (used by validation.js)
    uploadedFileMeta = null;

    // hidden input that holds server file_id for the 2-step flow
    if (hiddenFileId) hiddenFileId.value = "";

    // UI
    if (dropZone) dropZone.classList.remove("has-file", "invalid", "dragover");
    if (fileHint) fileHint.textContent = "";
    if (fileError) fileError.textContent = "";
  }

  function setFileUISuccess(meta){
    uploadedFileMeta = meta;
    if (hiddenFileId) hiddenFileId.value = meta.file_id || "";
    if (dropZone) dropZone.classList.add("has-file");
    if (fileHint) fileHint.textContent = `Attached: ${meta.filename} • ${readableBytes(meta.size)}`;
    setFileError("");
  }

  async function handleFiles(files){
    const file = files?.[0];
    if (!file) return;

    if (!LIMITS.ALLOWED_TYPES.includes(file.type)){
      setFileError("Unsupported file type. Please attach PDF/JPG/PNG/WEBP.");
      return;
    }
    if (file.size > LIMITS.MAX_FILE_BYTES){
      setFileError("File too large. Max allowed is 10 MB.");
      return;
    }

    setFileError("");
    if (fileHint) fileHint.textContent = "Uploading…";

    try {
      const meta = await uploadFile(uploadUrl, file);
      setFileUISuccess(meta);
    } catch (err){
      clearFileUI();
      setFileError(err.message);
    }
  }

  // Wire events
  if (dropZone){
    dropZone.addEventListener("click", () => fileInput?.click());
    dropZone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " "){
        e.preventDefault();
        fileInput?.click();
      }
    });
    dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("dragover"); });
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files);
    });
  }
  if (fileInput){
    fileInput.addEventListener("change", () => fileInput.files?.length && handleFiles(fileInput.files));
  }

  return {
    clear: clearFileUI,
    getMeta: () => uploadedFileMeta
  };
}
