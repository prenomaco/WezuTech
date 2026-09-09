"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import type { ProductSpecification } from "@/lib/product-detail";

const VISIBLE_COUNT = 5;

/**
 * All rows ship in the initial payload — there is nothing to fetch — only
 * the first five are on-screen. "View all" reveals the rest by animating
 * their container open with a single graceful overshoot rather than a flat
 * height snap, while the rows themselves rise in behind it.
 */
export function SpecificationsTable({
  items,
}: {
  readonly items: readonly ProductSpecification[];
}) {
  const [expanded, setExpanded] = useState(false);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const visible = items.slice(0, VISIBLE_COUNT);
  const rest = items.slice(VISIBLE_COUNT);

  function reveal() {
    const container = hiddenRef.current;
    if (expanded || !container) return;
    setExpanded(true);

    const rows = Array.from(container.querySelectorAll<HTMLElement>("[data-spec-row]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      gsap.set(container, { height: "auto", overflow: "visible" });
      gsap.set(rows, { autoAlpha: 1, y: 0 });
      if (buttonRef.current) gsap.set(buttonRef.current, { autoAlpha: 0, display: "none" });
      return;
    }

    const targetHeight = container.scrollHeight;
    gsap.set(rows, { autoAlpha: 0, y: 16 });

    gsap
      .timeline({
        onComplete: () => gsap.set(container, { height: "auto", overflow: "visible" }),
      })
      .to(container, { height: targetHeight, duration: 0.7, ease: "back.out(1.4)" })
      .to(rows, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.035 }, "-=0.45")
      .to(buttonRef.current, { autoAlpha: 0, duration: 0.25, ease: "power1.out" }, "-=0.3");
  }

  return (
    <>
      <div className="mt-[2.75rem] grid grid-cols-2 border-t border-[rgb(218_250_245/0.35)] text-center">
        <strong className="border-b border-[rgb(218_250_245/0.18)] py-3" data-motion="product-spec-row">
          Specification
        </strong>
        <strong className="border-b border-[rgb(218_250_245/0.18)] py-3" data-motion="product-spec-row">
          Details
        </strong>
        {visible.map((item) => (
          <div className="contents" key={item.specification}>
            <span className="border-b border-[rgb(218_250_245/0.12)] py-3 font-book" data-motion="product-spec-row">
              {item.specification}
            </span>
            <span className="border-b border-[rgb(218_250_245/0.12)] py-3 font-book" data-motion="product-spec-row">
              {item.details}
            </span>
          </div>
        ))}
      </div>

      {rest.length ? (
        <div
          aria-hidden={!expanded}
          className="grid grid-cols-2 overflow-hidden text-center"
          ref={hiddenRef}
          style={{ height: 0 }}
        >
          {rest.map((item) => (
            <div className="contents" key={item.specification}>
              <span className="border-b border-[rgb(218_250_245/0.12)] py-3 font-book" data-spec-row>
                {item.specification}
              </span>
              <span className="border-b border-[rgb(218_250_245/0.12)] py-3 font-book" data-spec-row>
                {item.details}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {rest.length ? (
        <div className="mt-8 flex justify-center" data-motion="product-spec-row">
          {/* Stays mounted through the reveal so the timeline can fade it
              out on its own beat instead of it vanishing the instant state
              flips. `autoAlpha` also drops it out of the tab order once
              hidden, so it doesn't need a separate `disabled` after. */}
          <button
            aria-expanded={expanded}
            className="text-[0.9375rem] text-ice underline underline-offset-4 transition-colors duration-200 ease-out hover:text-sky-bright"
            onClick={reveal}
            ref={buttonRef}
            type="button"
          >
            +{rest.length} more · View all
          </button>
        </div>
      ) : null}
    </>
  );
}
