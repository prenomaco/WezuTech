"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CarouselArrow } from "@/components/ui/carousel-arrow";
import { testimonials } from "@/content/site-content";

/**
 * Figma geometry (1512 frame): the notched outer frame is 725x261 at y=2637,
 * the attribution capsule 383x112 at y=2797 — it deliberately hangs 11px below
 * the frame and interrupts its lower hairline. Both outlines are drawn as
 * stroked SVG paths traced off the render; there is no exported artwork.
 */
const FRAME = { width: 725, height: 261 } as const;
const CAPSULE = { width: 383, height: 112 } as const;

const OUTER_PATH =
  "M26 .5 C13 .5 6 7 6 19 L6 222 C6 233 11 238.5 24 238.5 L40 238.5 " +
  "C66 239 74 260.5 100 260.5 L625 260.5 C651 260.5 659 239 685 238.5 " +
  "L701 238.5 C714 238.5 719 233 719 222 L719 19 C719 7 712 .5 699 .5 Z";

const CAPSULE_PATH =
  "M6 26 C6 15 10 11 22 10.5 C34 10 40 1 52 .5 L331 .5 C343 1 349 10 361 10.5 " +
  "C373 11 377 15 377 26 L377 96 C377 105 371 111.5 357 111.5 L26 111.5 " +
  "C12 111.5 6 105 6 96 Z";

/* Chevron glyphs at x=169 and right edge x=1362 — 65px and 45.6px from the
   1304 content column's edges, less the arrow button's 12px hit padding. */
const ARROW_LEFT = "left-[53px] top-[130.5px] -translate-y-1/2";
const ARROW_RIGHT = "right-[33.6px] top-[130.5px] -translate-y-1/2";

/** Dots measured off the render: 11px circles, 5px apart, 30px active pill. */
const DOT_BASE = "h-[11px] rounded-full transition-[width,background-color] duration-300 ease-out";

interface OutlineProps {
  readonly gradientId: string;
  readonly path: string;
  readonly viewBox: string;
  readonly fill: string;
}

/**
 * The Figma stroke is a vertical gradient: legible along the top and bottom
 * edges, almost invisible down the sides. Reproduced with a linear gradient
 * rather than a flat rule so the frame reads the same way.
 */
function Outline({ gradientId, path, viewBox, fill }: OutlineProps) {
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox={viewBox}>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#dafaf5" stopOpacity="0.45" />
          <stop offset="0.5" stopColor="#dafaf5" stopOpacity="0.12" />
          <stop offset="1" stopColor="#dafaf5" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <path d={path} fill={fill} stroke={`url(#${gradientId})`} strokeWidth="1" />
    </svg>
  );
}

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const content = useRef<HTMLQuoteElement>(null);
  const testimonial = testimonials[activeIndex];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !content.current) return;
    gsap.fromTo(
      content.current,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.28, ease: "power2.out", overwrite: "auto" },
    );
  }, [activeIndex]);

  const move = (direction: number) =>
    setActiveIndex((current) => (current + direction + testimonials.length) % testimonials.length);

  return (
    <div className="relative mt-[47px]" data-motion="testimonial-stage">
      <CarouselArrow
        className={ARROW_LEFT}
        direction="prev"
        label="Previous testimonial"
        onClick={() => move(-1)}
        scale="testimonial"
      />

      <div className="relative mx-auto h-[261px] w-[725px]">
        <Outline
          fill="rgb(218 250 245 / 0.014)"
          gradientId="quote-frame-stroke"
          path={OUTER_PATH}
          viewBox={`0 0 ${FRAME.width} ${FRAME.height}`}
        />

        <blockquote
          aria-live="polite"
          className="absolute left-1/2 top-[33px] w-[634px] -translate-x-1/2 text-center text-[17px] leading-[26px] text-ice"
          ref={content}
        >
          <p>
            “{testimonial.lead ? <strong className="font-semibold">{testimonial.lead}</strong> : null}
            {testimonial.quote}”
          </p>
        </blockquote>

        {/* top-[160px] = Figma y=2797 measured from the frame top at y=2637. */}
        <div className="absolute left-1/2 top-[160px] h-[112px] w-[383px] -translate-x-1/2">
          <Outline
            fill="var(--color-ink)"
            gradientId="quote-capsule-stroke"
            path={CAPSULE_PATH}
            viewBox={`0 0 ${CAPSULE.width} ${CAPSULE.height}`}
          />
          <div className="relative grid h-full place-items-center text-center text-[17px] leading-[26px] text-ice">
            <p>
              <strong className="font-semibold">{testimonial.client}</strong>
              <br />
              <span className="font-normal">{testimonial.title}</span>
            </p>
          </div>
        </div>
      </div>

      <CarouselArrow
        className={ARROW_RIGHT}
        direction="next"
        label="Next testimonial"
        onClick={() => move(1)}
        scale="testimonial"
      />

      <div
        aria-label="Testimonial selection"
        className="mt-[52px] flex items-center justify-center gap-[5px]"
        role="tablist"
      >
        {testimonials.map((item, index) => (
          <button
            aria-label={`Show testimonial ${index + 1}`}
            aria-selected={activeIndex === index}
            className={`${DOT_BASE} ${activeIndex === index ? "w-[30px] bg-sky" : "w-[11px] bg-ice"}`}
            key={item.client}
            onClick={() => setActiveIndex(index)}
            role="tab"
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
