"use client";
/* Dynamic CMS and Cloudinary media intentionally use native images. */
/* eslint-disable @next/next/no-img-element */

import { useState, type PointerEvent } from "react";

export function ProductGallery({ name, hero, gallery }: { readonly name: string; readonly hero: string; readonly gallery: readonly { url: string; alt: string }[] }) {
  const images = [{ url: hero, alt: `${name} main view` }, ...gallery].filter((item) => item.url);
  const [active, setActive] = useState(0);
  const preview = (event: PointerEvent<HTMLDivElement>, index: number) => {
    if (event.pointerType === "mouse") setActive(index);
  };
  if (!images.length) return null;
  return (
    <div className="relative order-first isolate min-h-[32rem] lg:order-none lg:min-h-[29.5rem]">
      {/* A stack of absolutely-positioned images crossfading on `active`,
          rather than swapping one `<img>`'s `src` — a hard swap has no
          transition to hook into, so hovering a thumbnail replaced the whole
          picture in a single frame. Product imagery deliberately remains
          `<img>`: administrators can provide Cloudinary URLs. */}
      <div className="relative h-[24rem] w-full lg:h-[29.5rem]">
        {images.map((image, index) => (
          <img
            alt={image.alt}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ease-out motion-reduce:transition-none ${
              index === active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            key={image.url}
            src={image.url}
          />
        ))}
      </div>
      {gallery.length ? (
        <div className="relative mt-4 flex flex-row justify-center gap-2 lg:absolute lg:right-0 lg:top-0 lg:mt-0 lg:flex-col">
          {images.slice(1).map((image, index) => (
            <div
              className={`h-[6.75rem] w-[5.8125rem] overflow-hidden rounded-[0.45rem] border transition-colors ${active === index + 1 ? "border-sky" : "border-transparent"}`}
              key={image.url}
              onPointerEnter={(event) => preview(event, index + 1)}
              onPointerLeave={() => setActive(0)}
            >
              <img alt={image.alt} className="h-full w-full object-cover" src={image.url} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
