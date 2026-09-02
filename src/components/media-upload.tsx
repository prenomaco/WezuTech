"use client";

import { ChangeEvent, useState } from "react";

export function MediaUpload({ initialUrl = "" }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [publicId, setPublicId] = useState("");
  const [state, setState] = useState("");
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setState("Uploading…");
    try {
      const signature = await fetch("/api/admin/upload-signature", { method: "POST" }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error);
        return r.json();
      });
      const payload = new FormData();
      payload.set("file", file);
      payload.set("api_key", signature.apiKey);
      payload.set("timestamp", String(signature.timestamp));
      payload.set("folder", signature.folder);
      payload.set("signature", signature.signature);
      const result = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`, {
        method: "POST",
        body: payload,
      }).then(async (r) => {
        if (!r.ok) throw new Error("Cloudinary upload failed.");
        return r.json();
      });
      setUrl(result.secure_url);
      setPublicId(result.public_id);
      setState("Upload complete.");
    } catch (error) {
      setState(error instanceof Error ? error.message : "Upload failed.");
    }
  }
  return (
    <label className="wide">
      Product card image
      <input
        name="imageUrl"
        type="url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://..."
      />
      <input name="imagePublicId" type="hidden" value={publicId} />
      <input type="file" accept="image/*,.pdf" onChange={upload} />
      {state && <small>{state}</small>}
    </label>
  );
}
