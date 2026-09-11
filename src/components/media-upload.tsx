"use client";

import { ChangeEvent, useRef, useState } from "react";
import { FileText, ImageOff, Loader2, Trash2, Upload } from "lucide-react";
import { Label } from "@/components/dashboard/ui";

/**
 * Signs an upload with the server, sends the file straight to Cloudinary, then
 * hands the resulting URL back to the surrounding form.
 *
 * The URL is a hidden field now, not a text input. It used to be editable, and
 * that was wrong twice over. It exposed internal paths — a product seeded from
 * the design files showed `/figma/4e3fa066….png` as if it were something to
 * type — and it was `type="url"`, which a site-relative path fails: opening
 * such a product and pressing Save gave a silent validation block on a field
 * nobody had touched. Cloudinary is where product media lives, so uploading is
 * the only way to set one, and what the form shows is the picture itself.
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
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isPdf = accept.includes("pdf");

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setState(`Uploading ${file.name}…`);
    try {
      const signature = await fetch("/api/admin/upload-signature", { method: "POST" }).then(
        async (response) => {
          if (!response.ok) throw new Error((await response.json()).error);
          return response.json();
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
      ).then(async (response) => {
        if (!response.ok) throw new Error("Cloudinary upload failed.");
        return response.json();
      });
      setUrl(result.secure_url);
      setPublicId(result.public_id);
      setState("Uploaded.");
    } catch (error) {
      setState(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
      /* So re-picking the same file fires `change` again. */
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function clear() {
    setUrl("");
    setPublicId("");
    setState("Removed. Save to apply.");
  }

  /** Cloudinary URLs are long; the tail is the part that identifies the file. */
  const caption = publicId || (url ? url.split("/").pop() : "");

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label>{label}</Label>
        {hint ? <p className="mt-0.5 text-xs text-[var(--dash-muted)]">{hint}</p> : null}
      </div>

      <div className="flex items-center gap-3">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-md border border-[var(--dash-border)] bg-[var(--dash-subtle)]">
          {url ? (
            isPdf ? (
              <FileText aria-hidden className="size-6 text-[var(--dash-muted)]" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded Cloudinary URLs
              <img alt="" className="h-full w-full object-cover" src={url} />
            )
          ) : (
            <ImageOff aria-hidden className="size-5 text-[var(--dash-muted)]" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <input name={name} type="hidden" value={url} />
          <input name={`${name}PublicId`} type="hidden" value={publicId} />

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--dash-border-strong)] px-2.5 text-xs font-medium text-[var(--dash-fg)] transition-colors hover:bg-[var(--dash-subtle)] disabled:pointer-events-none disabled:opacity-50"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              type="button"
            >
              {busy ? (
                <Loader2 aria-hidden className="size-3.5 animate-spin" />
              ) : (
                <Upload aria-hidden className="size-3.5" />
              )}
              {url ? "Replace" : "Upload"}
            </button>

            {url ? (
              <button
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-red-500/40 px-2.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                onClick={clear}
                type="button"
              >
                <Trash2 aria-hidden className="size-3.5" /> Remove
              </button>
            ) : null}
          </div>

          {caption ? (
            <p className="truncate text-xs text-[var(--dash-muted)]" title={caption}>
              {caption}
            </p>
          ) : null}
          {state ? <p className="text-xs text-[var(--dash-muted)]">{state}</p> : null}
        </div>
      </div>

      {/* Driven by the button above so the form shows one control language
          instead of a native file input in the middle of styled fields. */}
      <input accept={accept} className="hidden" onChange={upload} ref={fileRef} type="file" />
    </div>
  );
}
