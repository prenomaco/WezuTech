"use client";
/* Dynamic CMS and Cloudinary media intentionally use native images. */
/* eslint-disable @next/next/no-img-element */

import { useState, type PointerEvent } from "react";

/**
 * The product's images: one large view, with a rail of thumbnails to switch it.
 *
 * The rail used to be absolutely positioned at `right-0`, on top of the main
 * image. That covered the right ninety-odd pixels of the photograph, so a
 * charger with its cable on that side had the cable sitting underneath the
 * thumbnails, and the rail read as hanging off the edge of the picture. It is
 * a real column now: the two sit side by side and neither covers the other.
 *
 * Below `lg` the rail moves under the image as a horizontal strip, which is
 * the only direction there is room in at that width.
 */
const RAIL =
  "no-scrollbar flex shrink-0 gap-2 overflow-x-auto overflow-y-hidden " +
  "lg:max-h-[29.5rem] lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto";

const THUMB =
  "grid h-[6.75rem] w-[5.8125rem] shrink-0 place-items-center overflow-hidden rounded-[0.45rem] " +
  "border bg-[rgb(2_7_28/0.55)] transition-colors";

export function ProductGallery({
  name,
  hero,
  gallery,
}: {
  readonly name: string;
  readonly hero: string;
  readonly gallery: readonly { url: string; alt: string }[];
}) {
  const images = [{ url: hero, alt: `${name} main view` }, ...gallery].filter((item) => item.url);
  const [active, setActive] = useState(0);
  const preview = (event: PointerEvent<HTMLDivElement>, index: number) => {
    if (event.pointerType === "mouse") setActive(index);
  };
  if (!images.length) return null;

  const thumbnails = images.slice(1);

  return (
    <div className="order-first flex min-w-0 flex-col gap-4 lg:order-none lg:flex-row lg:items-start lg:gap-3">
      {/* A stack of absolutely-positioned images crossfading on `active`,
          rather than swapping one `<img>`'s `src`: a hard swap has no
          transition to hook into, so hovering a thumbnail replaced the whole
          picture in a single frame. Product imagery deliberately remains
          `<img>`: administrators can provide Cloudinary URLs. */}
      <div className="relative h-[24rem] min-w-0 flex-1 lg:h-[29.5rem]">
        {images.map((image, index) => (
          <img
            alt={image.alt}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ease-out motion-reduce:transition-none ${
              index === active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            key={`${image.url}-${index}`}
            src={image.url}
          />
        ))}
      </div>

      {thumbnails.length ? (
        <div
          className={`${RAIL} ${
            /* Centred while the strip is short, packed to the start once it
               overflows: `justify-center` on a scroll container puts the
               first items out of reach past the start edge. */
            thumbnails.length > 3 ? "justify-start" : "justify-center lg:justify-start"
          }`}
        >
          {/* `contain`, not `cover`.
              The frame is portrait (93 x 108) and the product photography is
              landscape, so `cover` scaled each shot until it filled the height
              and then cropped about a third off each side: the charger in the
              thumbnail was a different picture from the one it selected.
              Contained, the whole frame shows, and the box fills its spare
              height with the page's own ink so the letterboxing reads as a
              mount rather than a gap. */}
          {thumbnails.map((image, index) => (
            <div
              className={`${THUMB} ${active === index + 1 ? "border-sky" : "border-[rgb(218_250_245/0.12)]"}`}
              key={`${image.url}-${index}`}
              onPointerEnter={(event) => preview(event, index + 1)}
              onPointerLeave={() => setActive(0)}
            >
              <img alt={image.alt} className="h-full w-full object-contain p-1" src={image.url} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
