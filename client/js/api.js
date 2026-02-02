// api.js
export async function uploadFile(uploadUrl, file){
  const formData = new FormData();
  formData.append("file", file);

  const resp = await fetch(uploadUrl, { method: "POST", body: formData });
  if (!resp.ok){
    let payload;
    try { payload = await resp.json(); } catch {}
    throw new Error(payload?.detail || payload?.message || `Upload failed (${resp.status})`);
  }
  const data = await resp.json();
  return {
    file_id: data.file_id || data.id || "",
    filename: data.filename || file.name,
    url: data.url || "",
    size: data.size || file.size
  };
}

export async function postJson(url, payload){
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!resp.ok){
    let data;
    try { data = await resp.json(); } catch {}
    throw new Error(data?.detail || data?.message || `Request failed (${resp.status})`);
  }
  return resp.json();
}
