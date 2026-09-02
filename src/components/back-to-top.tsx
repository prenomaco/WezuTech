"use client";

import { useEffect, useState } from "react";

/** Distance scrolled before the control appears, in pixels. */
const REVEAL_AFTER = 560;

const BASE =
  "fixed bottom-[1.375rem] left-[1.375rem] z-40 grid h-10 w-10 place-items-center rounded-full border border-[rgb(218_250_245/0.28)] bg-ink-raised/80 text-ice backdrop-blur-[2px] transition-[opacity,transform,background-color] duration-300 ease-out hover:bg-ink-raised";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > REVEAL_AFTER);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const returnToTop = () => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    window.scrollTo({ top: 0, behavior });
  };

  return (
    <button
      className={`${BASE} ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
      type="button"
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={returnToTop}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path
          d="M12 19V5M6.5 10.5 12 5l5.5 5.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
