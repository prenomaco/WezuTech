"use client";

import { ChangeEvent, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, FileText, ImageOff, Loader2, Trash2, Upload } from "lucide-react";
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
/**
 * One signed upload to Cloudinary.
 *
 * Shared by the single-image field and the gallery below it, so there is one
 * place that knows the signature dance rather than two that drift.
 */
async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
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
  const result = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`, {
    method: "POST",
    body: payload,
  }).then(async (response) => {
    if (!response.ok) throw new Error("Cloudinary upload failed.");
    return response.json();
  });
  return { url: result.secure_url as string, publicId: result.public_id as string };
}

export interface GalleryImage {
  readonly url: string;
  readonly publicId: string;
}

/**
 * The product's gallery, at whatever length it needs to be.
 *
 * This replaced two fixed slots labelled "Gallery thumbnail 1" and "Gallery
 * thumbnail 2", which capped every product at exactly two extra views and
 * left an empty upload box on any product that only had one. The list posts
 * as JSON in a single hidden field, so adding a seventh image needs no new
 * form field and no migration.
 *
 * Order is the order shown on the product page, and the arrows move an image
 * through it: which view a visitor sees first matters, and re-uploading in a
 * different sequence is not a reasonable way to ask for that.
 */
export function GalleryUpload({ initial }: { readonly initial: readonly GalleryImage[] }) {
  const [images, setImages] = useState<readonly GalleryImage[]>(initial);
  const [state, setState] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function add(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    if (!files.length) return;
    setBusy(true);
    setState(`Uploading ${files.length} image${files.length === 1 ? "" : "s"}…`);
    try {
      const uploaded = await Promise.all(files.map(uploadToCloudinary));
      setImages((current) => [...current, ...uploaded]);
      setState(`Added ${uploaded.length}.`);
    } catch (error) {
      setState(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function move(index: number, by: -1 | 1) {
    setImages((current) => {
      const next = [...current];
      const target = index + by;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <div>
        <Label>Gallery images</Label>
        <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
          Extra views, shown as the thumbnails beside the main image on the product page. Add as
          many as you like; the first one here appears first.
        </p>
      </div>

      <input name="gallery" type="hidden" value={JSON.stringify(images)} />

      {images.length ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {images.map((image, index) => (
            <li
              className="group relative overflow-hidden rounded-md border border-[var(--dash-border)] bg-[rgb(2_7_28/0.45)]"
              key={`${image.url}-${index}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded Cloudinary URLs */}
              <img alt="" className="aspect-square w-full object-contain p-1" src={image.url} />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-[rgb(2_7_28/0.85)] px-1 py-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <div className="flex gap-0.5">
                  <button
                    aria-label={`Move image ${index + 1} earlier`}
                    className="grid size-6 place-items-center rounded text-[var(--dash-muted)] hover:bg-[var(--dash-subtle)] hover:text-[var(--dash-fg)] disabled:opacity-30"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    type="button"
                  >
                    <ArrowLeft aria-hidden className="size-3.5" />
                  </button>
                  <button
                    aria-label={`Move image ${index + 1} later`}
                    className="grid size-6 place-items-center rounded text-[var(--dash-muted)] hover:bg-[var(--dash-subtle)] hover:text-[var(--dash-fg)] disabled:opacity-30"
                    disabled={index === images.length - 1}
                    onClick={() => move(index, 1)}
                    type="button"
                  >
                    <ArrowRight aria-hidden className="size-3.5" />
                  </button>
                </div>
                <button
                  aria-label={`Remove image ${index + 1}`}
                  className="grid size-6 place-items-center rounded text-red-400 hover:bg-red-500/10"
                  onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                  type="button"
                >
                  <Trash2 aria-hidden className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
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
          Add images
        </button>
        {state ? <span className="text-xs text-[var(--dash-muted)]">{state}</span> : null}
      </div>

      <input accept="image/*" className="hidden" multiple onChange={add} ref={fileRef} type="file" />
    </div>
  );
}

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
      const uploaded = await uploadToCloudinary(file);
      setUrl(uploaded.url);
      setPublicId(uploaded.publicId);
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
        {/* 96px, not 64. These renders are wide line drawings on a dark
            ground, and at thumbnail size a charger and a battery pack are the
            same grey smudge: the preview has to be big enough to confirm the
            right file went up. */}
        <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--dash-border)] bg-[rgb(2_7_28/0.45)]">
          {url ? (
            isPdf ? (
              <FileText aria-hidden className="size-8 text-[var(--dash-muted)]" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded Cloudinary URLs
              <img alt="" className="h-full w-full object-contain p-1" src={url} />
            )
          ) : (
            <ImageOff aria-hidden className="size-7 text-[var(--dash-muted)]" />
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
