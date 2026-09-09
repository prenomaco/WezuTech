"use client";

import { ChangeEvent, useState } from "react";
import { Input, Label } from "@/components/dashboard/ui";

/**
 * Signs an upload with the server, sends the file straight to Cloudinary, then
 * hands the resulting URL back to the surrounding form.
 *
 * The file input is styled through `::file-selector-button` — a native control
 * cannot be replaced without losing the browser's own file picker, so the
 * button inside it takes the dashboard's colours instead.
 */
export function MediaUpload({
  initialUrl = "",
  initialPublicId = "",
  label = "Product card image",
  name = "imageUrl",
  accept = "image/*",
}: {
  readonly initialUrl?: string;
  readonly initialPublicId?: string;
  readonly label?: string;
  readonly name?: string;
  readonly accept?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [publicId, setPublicId] = useState(initialPublicId);
  const [state, setState] = useState("");

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setState("Uploading…");
    try {
      const signature = await fetch("/api/admin/upload-signature", { method: "POST" }).then(
        async (r) => {
          if (!r.ok) throw new Error((await r.json()).error);
          return r.json();
        },
      );
      const payload = new FormData();
      payload.set("file", file);
      payload.set("api_key", signature.apiKey);
      payload.set("timestamp", String(signature.timestamp));
      payload.set("folder", signature.folder);
      payload.set("signature", signature.signature);
      const result = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`,
        { method: "POST", body: payload },
      ).then(async (r) => {
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
    <div className="flex flex-col gap-2 sm:col-span-2">
      <Label>{label}</Label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--dash-muted)]">Paste an image or file URL</span>
        <Input
          name={name}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://..."
          type="url"
          value={url}
        />
      </label>
      <input name={`${name}PublicId`} type="hidden" value={publicId} />
      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--dash-muted)]">Or upload from your device</span>
        <input
          accept={accept}
          className="w-full text-sm text-[var(--dash-muted)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--dash-subtle)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[var(--dash-fg)] hover:file:bg-[var(--dash-card-hover)]"
          onChange={upload}
          type="file"
        />
      </label>
      {state ? <small className="text-xs text-[var(--dash-muted)]">{state}</small> : null}
    </div>
  );
}
