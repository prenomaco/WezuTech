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
const ARROW_LEFT = "left-0 top-[8.15625rem] -translate-y-1/2 lg:left-[3.3125rem]";
const ARROW_RIGHT = "right-0 top-[8.15625rem] -translate-y-1/2 lg:right-[2.1rem]";

/** Dots measured off the render: 11px circles, 5px apart, 30px active pill. */
const DOT_BASE = "h-[0.6775625rem] rounded-full transition-[width,background-color] duration-300 ease-out";

/**
 * The quote frame and its attribution capsule.
 *
 * Both are filled `black` at 10% — they darken the page rather than tinting
 * it. The stroke is not in the export, and measuring the render shows it is
 * not a full outline either: down the frame's sides the page reads 7.5/255,
 * exactly the page ink, and along its bottom 5.7, which is the fill darkening
 * the ink with nothing drawn over it. Only the top edge carries a stroke, and
 * only the capsule's bottom does.
 *
 * So each shape gets one lit edge, faded at both ends. Two gradients do it:
 * a horizontal one supplies the colour, running 0 at the ends to `strokeAlpha`
 * across the middle, and a vertical mask decides which edge survives.
 */
function Outline({ shape, gradientId }: { shape: FramePath; gradientId: string }) {
  const maskId = `${gradientId}-mask`;
  const lit = shape.litEdge === "top";

  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      /* Below `lg` the box is no longer the shape's own aspect ratio, so the
         frame has to stretch to it rather than letterbox inside it. */
      preserveAspectRatio="none"
      viewBox={`0 0 ${shape.width} ${shape.height}`}
    >
      <defs>
        {/* Measured across the lit edge: 0 at both ends, flat over the middle
            third. The shoulders are where the corner chamfers turn away. */}
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#dafaf5" stopOpacity="0" />
          <stop offset="0.06" stopColor="#dafaf5" stopOpacity={shape.strokeAlpha * 0.61} />
          <stop offset="0.17" stopColor="#dafaf5" stopOpacity={shape.strokeAlpha * 0.79} />
          <stop offset="0.34" stopColor="#dafaf5" stopOpacity={shape.strokeAlpha * 0.96} />
          <stop offset="0.45" stopColor="#dafaf5" stopOpacity={shape.strokeAlpha} />
          <stop offset="0.56" stopColor="#dafaf5" stopOpacity={shape.strokeAlpha} />
          <stop offset="0.67" stopColor="#dafaf5" stopOpacity={shape.strokeAlpha * 0.96} />
          <stop offset="0.83" stopColor="#dafaf5" stopOpacity={shape.strokeAlpha * 0.79} />
          <stop offset="0.94" stopColor="#dafaf5" stopOpacity={shape.strokeAlpha * 0.57} />
          <stop offset="1" stopColor="#dafaf5" stopOpacity="0" />
        </linearGradient>

        {/* Keeps the stroke on one edge and lets it die within a third of the
            height, which is where the render loses it. */}
        <linearGradient id={maskId} x1="0" x2="0" y1="0" y2="1">
          {(lit
            ? [
                [0, 1],
                [0.3, 1],
                [0.45, 0],
                [1, 0],
              ]
            : [
                [0, 0],
                [0.55, 0],
                [0.7, 1],
                [1, 1],
              ]
          ).map(([offset, value]) => (
            <stop key={offset} offset={offset} stopColor={value ? "#fff" : "#000"} />
          ))}
        </linearGradient>
        <mask id={`${maskId}-m`}>
          <rect fill={`url(#${maskId})`} height={shape.height} width={shape.width} x="0" y="0" />
        </mask>
      </defs>

      <path
        d={shape.d}
        fill="rgb(0 0 0 / 0.1)"
        transform={shape.flipY ? `translate(0 ${shape.height}) scale(1 -1)` : undefined}
      />
      <g mask={`url(#${maskId}-m)`}>
        <path
          d={shape.d}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1"
          transform={shape.flipY ? `translate(0 ${shape.height}) scale(1 -1)` : undefined}
        />
      </g>
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

      {/* The frame is a fixed composition at 1512 — 725.27 x 16.33rem with the
          quote and capsule placed inside it. Narrower than that the quote needs
          more lines than the frame is tall, so below `lg` the box grows with
          its content, the capsule follows in flow, and the frame stretches. */}
      <div className="relative mx-auto w-full max-w-[45.3290625rem] px-9 pt-[2.0625rem] pb-[2.5rem] lg:h-[16.3293125rem] lg:w-[45.3290625rem] lg:px-0 lg:pt-0 lg:pb-0">
        <Outline gradientId="quote-frame-stroke" shape={QUOTE_FRAME} />

        <blockquote
          aria-live="polite"
          className="relative text-center text-[1rem] font-book leading-[1.5rem] text-ice lg:absolute lg:left-1/2 lg:top-[2.0625rem] lg:w-[39.625rem] lg:-translate-x-1/2 lg:text-[1.219625rem] lg:leading-[1.625rem]"
          ref={content}
        >
          <p>
            “{testimonial.lead ? <strong className="font-semibold">{testimonial.lead}</strong> : null}
            {testimonial.quote}”
          </p>
        </blockquote>

        {/* Figma y=2797.25 against the frame top at y=2636.80 = 160.45px. */}
        <div className="relative mx-auto mt-[1.75rem] h-[6.9789375rem] w-full max-w-[23.9180625rem] lg:absolute lg:left-1/2 lg:top-[10.028125rem] lg:mt-0 lg:w-[23.9180625rem] lg:-translate-x-1/2">
          <Outline gradientId="quote-capsule-stroke" shape={QUOTE_CAPSULE} />
          <div className="relative grid h-full place-items-center px-4 text-center text-[1rem] font-book leading-[1.5rem] text-ice lg:px-0 lg:text-[1.219625rem] lg:leading-[1.625rem]">
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
