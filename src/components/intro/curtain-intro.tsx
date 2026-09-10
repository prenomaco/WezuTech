"use client";

import gsap from "gsap";
import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

/** Vertical columns the cover splits into — each one its own top/bottom pair. */
const BAR_COUNT = 7;

/**
 * Load-time intro, on every visit: the screen holds on the site's deep navy,
 * then splits into {@link BAR_COUNT} columns, each a top bar and a bottom
 * bar meeting at the vertical centre. On open, every column's top bar moves
 * back up and its bottom bar moves back down, staggered column to column,
 * to reveal the page beneath.
 *
 * The logo itself doesn't fade in — it is simply present from the first
 * frame, the same frame the cover itself appears on, so there is nothing
 * timed against asset loading to go wrong. It does fade out, gracefully,
 * right before the bars start moving.
 *
 * Unconditional JSX, not a `useState` gated behind a client-only check: the
 * cover has to be the very first thing painted — before hydration, before
 * GSAP loads, cache or no cache — so there is never a frame where the real
 * page shows through first. The `.curtain-intro` class in globals.css is
 * what actually guarantees it can't get stuck covering the site: a plain CSS
 * animation clears it on its own after 6s if a script error ever kept the
 * GSAP timeline below from reaching its own completion, and hides it
 * immediately for `prefers-reduced-motion` without waiting on JS at all.
 *
 * A fixed overlay, not a block pushed in above Hero: the page underneath is
 * already sitting at its normal scroll position the whole time, so there is
 * nothing left to disturb once this unmounts.
 */
export function CurtainIntro() {
  const [done, setDone] = useState(false);
  const topRefs = useRef<HTMLDivElement[]>([]);
  const bottomRefs = useRef<HTMLDivElement[]>([]);
  const logoRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const blockInput = (event: Event) => event.preventDefault();
    window.addEventListener("wheel", blockInput, { passive: false });
    window.addEventListener("touchmove", blockInput, { passive: false });

    const timeline = gsap.timeline({
      defaults: { ease: "power4.inOut" },
      onComplete: () => {
        window.removeEventListener("wheel", blockInput);
        window.removeEventListener("touchmove", blockInput);
        document.body.style.overflow = previousOverflow;
        setDone(true);
      },
    });

    timeline
      .set([...topRefs.current, ...bottomRefs.current], { yPercent: 0 })
      .set(logoRef.current, { autoAlpha: 1 })
      .to({}, { duration: 1.5 })
      .addLabel("open")
      .to(logoRef.current, { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, "open-=0.1")
      .to(topRefs.current, { duration: 0.9, stagger: 0.05, yPercent: -100 }, "open")
      .to(bottomRefs.current, { duration: 0.9, stagger: 0.05, yPercent: 100 }, "open");

    return () => {
      window.removeEventListener("wheel", blockInput);
      window.removeEventListener("touchmove", blockInput);
      document.body.style.overflow = previousOverflow;
      timeline.kill();
    };
  }, []);

  if (done) return null;

  return (
    <>
      <div aria-hidden="true" className="curtain-intro fixed inset-0 z-[100] overflow-hidden">
        <div className="absolute inset-x-0 top-0 flex h-1/2">
          {Array.from({ length: BAR_COUNT }).map((_, index) => (
            <div
              className="-ml-px h-full flex-1 bg-sky-bright first:ml-0"
              key={index}
              ref={(el) => {
                if (el) topRefs.current[index] = el;
              }}
            />
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex h-1/2">
          {Array.from({ length: BAR_COUNT }).map((_, index) => (
            <div
              className="-ml-px h-full flex-1 bg-sky-bright first:ml-0"
              key={index}
              ref={(el) => {
                if (el) bottomRefs.current[index] = el;
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 grid place-items-center">
          <div className="pointer-events-none flex items-center gap-4 sm:gap-6" ref={logoRef}>
            <Image
              alt=""
              className="h-12 w-12 sm:h-16 sm:w-16"
              height={44}
              priority
              src="/brand/mark.svg"
              style={{ filter: "brightness(0) invert(1)" }}
              width={45}
            />
            <Image
              alt="Wezu Technologies"
              className="h-10 w-auto sm:h-14"
              height={536}
              priority
              src="/brand/wordmark-lockup.png"
              width={1037}
            />
          </div>
        </div>
      </div>
      {/* No JS at all: the cover would otherwise block the entire site. */}
      <noscript>
        <style>{".curtain-intro { display: none; }"}</style>
      </noscript>
    </>
  );
}
