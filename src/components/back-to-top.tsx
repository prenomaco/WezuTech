"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Distance scrolled before the control appears, in pixels. */
const REVEAL_AFTER = 560;

/*
 * No `backdrop-filter`, and an opaque background instead of 80%.
 *
 * This control is `fixed`, so a backdrop filter on it has to be recomputed
 * against whatever has just scrolled underneath — every frame, for as long as
 * the page is moving. Two pixels of blur behind a 40px disc is not worth a
 * per-frame backdrop read, least of all in the engines that do it on the CPU.
 */
/*
 * Inset to the site's own gutter rather than a tighter value of its own.
 *
 * The marketing pages never place anything closer than 26px to the edge, and
 * at 22px this disc read as pushed into the corner next to them.
 */
const BASE =
  "fixed bottom-[1.625rem] right-[1.625rem] z-40 grid h-10 w-10 place-items-center rounded-full border border-[rgb(218_250_245/0.28)] bg-ink-raised text-ice transition-[opacity,transform,background-color] duration-300 ease-out hover:bg-ink-raised";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  /*
   * Not in the dashboard.
   *
   * This is mounted in the root layout, so it was also floating over the admin
   * pages, where the product form ends in a sticky save bar pinned to the same
   * corner: the disc sat on top of "Save changes". The dashboard's pages are
   * short and its own chrome is always in reach, so the control has nothing to
   * do there.
   */
  const inDashboard = usePathname().startsWith("/admin");

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

  if (inDashboard) return null;

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
