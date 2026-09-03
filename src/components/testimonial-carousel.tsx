"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CarouselArrow } from "@/components/ui/carousel-arrow";
import { QUOTE_CAPSULE, QUOTE_FRAME, type FramePath } from "@/lib/design/testimonial-frame";
import { testimonials } from "@/content/site-content";

/**
 * Figma geometry (1512 frame): the notched frame is 725.265 x 261.269 at
 * y=2636.80, the capsule 382.689 x 111.663 at y=2797.25 — it hangs below the
 * frame's lower edge and interrupts its hairline. Both shapes come from the
 * file (nodes 252:512 / 252:516) rather than being traced.
 */
/* Chevron glyphs at x=169 and right edge x=1362 — 65px and 45.6px from the
   1304 content column's edges, less the arrow button's 12px hit padding. */
const ARROW_LEFT = "left-[3.3125rem] top-[8.15625rem] -translate-y-1/2";
const ARROW_RIGHT = "right-[2.1rem] top-[8.15625rem] -translate-y-1/2";

/** Dots measured off the render: 11px circles, 5px apart, 30px active pill. */
const DOT_BASE = "h-[0.6775625rem] rounded-full transition-[width,background-color] duration-300 ease-out";

/**
 * The shape is filled `black` at 10% — it darkens the page rather than tinting
 * it. Its stroke is not in the export but is plainly in the render, visible
 * along the top and bottom edges and gone down the sides, so it is drawn as a
 * vertical gradient at the alpha measured off those edges.
 */
function Outline({ shape, gradientId }: { shape: FramePath; gradientId: string }) {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      viewBox={`0 0 ${shape.width} ${shape.height}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#dafaf5" stopOpacity={shape.strokeAlpha} />
          <stop offset="0.5" stopColor="#dafaf5" stopOpacity={shape.strokeAlpha * 0.12} />
          <stop offset="1" stopColor="#dafaf5" stopOpacity={shape.strokeAlpha} />
        </linearGradient>
      </defs>
      <path
        d={shape.d}
        fill="rgb(0 0 0 / 0.1)"
        stroke={`url(#${gradientId})`}
        strokeWidth="1"
        transform={shape.flipY ? `translate(0 ${shape.height}) scale(1 -1)` : undefined}
      />
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
    <div className="relative mt-[2.9375rem]" data-motion="testimonial-stage">
      <CarouselArrow
        className={ARROW_LEFT}
        direction="prev"
        label="Previous testimonial"
        onClick={() => move(-1)}
        scale="testimonial"
      />

      <div className="relative mx-auto h-[16.3293125rem] w-[45.3290625rem]">
        <Outline gradientId="quote-frame-stroke" shape={QUOTE_FRAME} />

        <blockquote
          aria-live="polite"
          className="absolute left-1/2 top-[2.0625rem] w-[39.625rem] -translate-x-1/2 text-center text-[1.219625rem] font-book leading-[1.625rem] text-ice"
          ref={content}
        >
          <p>
            “{testimonial.lead ? <strong className="font-semibold">{testimonial.lead}</strong> : null}
            {testimonial.quote}”
          </p>
        </blockquote>

        {/* Figma y=2797.25 against the frame top at y=2636.80 = 160.45px. */}
        <div className="absolute left-1/2 top-[10.028125rem] h-[6.9789375rem] w-[23.9180625rem] -translate-x-1/2">
          <Outline gradientId="quote-capsule-stroke" shape={QUOTE_CAPSULE} />
          <div className="relative grid h-full place-items-center text-center text-[1.219625rem] font-book leading-[1.625rem] text-ice">
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
        className="mt-[3.25rem] flex items-center justify-center gap-[0.33875rem]"
        role="tablist"
      >
        {testimonials.map((item, index) => (
          <button
            aria-label={`Show testimonial ${index + 1}`}
            aria-selected={activeIndex === index}
            className={`${DOT_BASE} ${activeIndex === index ? "w-[1.8971875rem] bg-sky" : "w-[0.6775625rem] bg-ice"}`}
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
