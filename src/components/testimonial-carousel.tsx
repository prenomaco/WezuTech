"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CarouselArrow } from "@/components/ui/carousel-arrow";
import { NotchedPanel } from "@/components/ui/notched-panel";
import { QUOTE_CAPSULE, QUOTE_FRAME } from "@/lib/design/testimonial-frame";
import { testimonials } from "@/content/site-content";

/**
 * Figma geometry (1512 frame): the notched frame is 725.265 x 261.269 at
 * y=2636.80, the capsule 382.689 x 111.663 at y=2797.25 — it hangs below the
 * frame's lower edge and interrupts its hairline. Both shapes come from the
 * file (nodes 252:512 / 252:516) rather than being traced.
 */
/* Chevron glyphs at x=169 and right edge x=1362 — 65px and 45.6px from the
   1304 content column's edges, less the arrow button's 12px hit padding. */
/* 402 frame: chevrons at x=17 and 382.2, on y=3653 — 120 into the block. */
const ARROW_LEFT = "left-[1.0625rem] top-[7.5rem] -translate-y-1/2 lg:left-[3.3125rem] lg:top-[8.15625rem]";
const ARROW_RIGHT = "right-[1.0625rem] top-[7.5rem] -translate-y-1/2 lg:right-[2.1rem] lg:top-[8.15625rem]";

/** Dots measured off the render: 11px circles, 5px apart, 30px active pill. */
/* The 402 frame shrinks the row to 41.59 wide on 4.73px dots. */
const DOT_BASE =
  "h-[0.2955rem] rounded-full transition-[width,background-color] duration-300 ease-out lg:h-[0.6775625rem]";

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
      {/* 402 frame: a 316.18 x 243.9 block at x=43, its copy 276.48 wide and
          starting 14.65 down. */}
      <div className="relative mx-auto w-full max-w-[19.76125rem] px-[1.240625rem] pt-[0.915625rem] pb-[2.5rem] lg:h-[16.3293125rem] lg:w-[45.3290625rem] lg:max-w-none lg:px-0 lg:pt-0 lg:pb-0">
        <NotchedPanel gradientId="quote-frame-stroke" shape={QUOTE_FRAME} />

        <blockquote
          aria-live="polite"
          /* 276.48 wide and 176 tall over eight lines. */
          className="relative text-center text-[0.875rem] font-book leading-[1.375rem] text-ice lg:absolute lg:left-1/2 lg:top-[2.0625rem] lg:w-[39.625rem] lg:-translate-x-1/2 lg:text-[1.219625rem] lg:leading-[1.625rem]"
          ref={content}
        >
          <p>
            “{testimonial.lead ? <strong className="font-semibold">{testimonial.lead}</strong> : null}
            {testimonial.quote}”
          </p>
        </blockquote>

        {/* Figma y=2797.25 against the frame top at y=2636.80 = 160.45px. */}
        {/* 402 frame: a 230 x 64 capsule at x=80, 203 down the block — so it
            hangs past its bottom edge, as it does at 1512. */}
        <div className="relative mx-auto mt-[0.8125rem] h-[4rem] w-full max-w-[14.375rem] lg:absolute lg:left-1/2 lg:top-[10.028125rem] lg:mt-0 lg:h-[6.9789375rem] lg:w-[23.9180625rem] lg:max-w-none lg:-translate-x-1/2">
          <NotchedPanel gradientId="quote-capsule-stroke" shape={QUOTE_CAPSULE} />
          <div className="relative grid h-full place-items-center px-4 text-center text-[0.8125rem] font-book leading-[1.1875rem] text-ice lg:px-0 lg:text-[1.219625rem] lg:leading-[1.625rem]">
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
        className="mt-[1.5rem] flex items-center justify-center gap-[0.1875rem] lg:mt-[3.25rem] lg:gap-[0.33875rem]"
        role="tablist"
      >
        {testimonials.map((item, index) => (
          <button
            aria-label={`Show testimonial ${index + 1}`}
            aria-selected={activeIndex === index}
            className={`${DOT_BASE} ${activeIndex === index ? "w-[0.8275rem] bg-sky lg:w-[1.8971875rem]" : "w-[0.2955rem] bg-ice lg:w-[0.6775625rem]"}`}
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
