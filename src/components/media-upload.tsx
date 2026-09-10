"use client";

import { ChangeEvent, useState } from "react";
import { FileText, ImageOff } from "lucide-react";
import { Input, Label } from "@/components/dashboard/ui";

/**
 * Signs an upload with the server, sends the file straight to Cloudinary, then
 * hands the resulting URL back to the surrounding form.
 *
 * The file input is styled through `::file-selector-button` — a native control
 * cannot be replaced without losing the browser's own file picker, so the
 * button inside it takes the dashboard's colours instead. A thumbnail sits
 * beside the inputs so nine near-identical upload fields stay tellable apart
 * at a glance instead of by reading each URL.
 */
export function MediaUpload({
  initialUrl = "",
  initialPublicId = "",
  label = "Product card image",
  hint,
  name = "imageUrl",
  accept = "image/*",
}: {
  readonly initialUrl?: string;
  readonly initialPublicId?: string;
  readonly label?: string;
  /** Where this shows up on the live page — displayed under the label. */
  readonly hint?: string;
  readonly name?: string;
  readonly accept?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [publicId, setPublicId] = useState(initialPublicId);
  const [state, setState] = useState("");
  const isPdf = accept.includes("pdf");

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
    <div className="flex flex-col gap-2">
      <div>
        <Label>{label}</Label>
        {hint ? <p className="mt-0.5 text-xs text-[var(--dash-muted)]">{hint}</p> : null}
      </div>
      <div className="flex gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-[var(--dash-border)] bg-[var(--dash-subtle)]">
          {url ? (
            isPdf ? (
              <FileText aria-hidden className="size-6 text-[var(--dash-muted)]" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- admin-supplied Cloudinary/arbitrary URLs
              <img alt="" className="h-full w-full object-cover" src={url} />
            )
          ) : (
            <ImageOff aria-hidden className="size-5 text-[var(--dash-muted)]" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Input
            name={name}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste an image or file URL"
            type="url"
            value={url}
          />
          <input name={`${name}PublicId`} type="hidden" value={publicId} />
          <input
            accept={accept}
            className="w-full text-xs text-[var(--dash-muted)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--dash-subtle)] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[var(--dash-fg)] hover:file:bg-[var(--dash-card-hover)]"
            onChange={upload}
            type="file"
          />
        </div>
      </div>
      {state ? <small className="text-xs text-[var(--dash-muted)]">{state}</small> : null}
    </div>
  );
}
