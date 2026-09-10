"use client";

import { MouseEvent, useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { primaryNav } from "@/content/site-content";

/**
 * The small-screen navigation.
 *
 * Figma draws the closed state only — node 305:61, a 32px glyph at x=325,
 * y=34 of the 402 frame — so the panel below it is the design's own type and
 * colours applied to the one interaction the icon implies.
 */
function MenuGlyph({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" className="size-8" fill="none" viewBox="0 0 32 32">
      {open ? (
        <path
          d="M25 7 7 25M7 7l18 18"
          stroke="white"
          strokeLinecap="round"
          strokeWidth="2"
        />
      ) : (
        /* Node 305:61: three 2px rules inset 4px, on 8 / 16 / 24. */
        <path
          d="M28 16a1 1 0 0 1-1 1H5a1 1 0 1 1 0-2h22a1 1 0 0 1 1 1ZM5 9h22a1 1 0 0 0 0-2H5a1 1 0 0 0 0 2Zm22 14H5a1 1 0 0 0 0 2h22a1 1 0 0 0 0-2Z"
          fill="white"
        />
      )}
    </svg>
  );
}

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  /* Where the panel expands from and collapses back to — the toggle button
     itself, read at the moment it's pressed, not a fixed guess at its
     position, so the reveal still anchors correctly if that ever changes.
     `radius` is the distance from there to the viewport's farthest corner:
     `circle()` only accepts the `closest-side` / `farthest-side` keywords,
     not `farthest-corner`, so full coverage has to be a measured pixel
     value instead. */
  const [reveal, setReveal] = useState({ radius: 0, x: 0, y: 0 });

  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    setReveal({ radius, x, y });
    setOpen((value) => !value);
  };

  /* The panel covers the page, so the page behind it must not scroll under it. */
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        aria-controls="mobile-nav"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="absolute z-[201] flex size-8 items-center justify-center"
        onClick={toggle}
        /* Node 305:61 — 325 / 402 across, 34 down. */
        style={{ left: "80.8458%", top: "2.125rem" }}
        type="button"
      >
        <MenuGlyph open={open} />
      </button>

      <div
        className={`fixed inset-0 z-[200] bg-ink/95 backdrop-blur-sm transition-[clip-path] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "" : "pointer-events-none"
        }`}
        id="mobile-nav"
        inert={!open}
        style={{
          clipPath: `circle(${open ? reveal.radius : 0}px at ${reveal.x}px ${reveal.y}px)`,
        }}
      >
        <nav
          aria-label="Main"
          className="flex h-full flex-col items-center justify-center gap-8 text-[1.125rem] leading-[1.5rem]"
        >
          {primaryNav.map(({ label, href }) => (
            <a
              className="nav-link text-mist transition-colors duration-200 ease-out hover:text-sky"
              href={href}
              key={label}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
          <ButtonLink href="#contact" onClick={() => setOpen(false)}>
            Contact Us
          </ButtonLink>
        </nav>
      </div>
    </div>
  );
}
