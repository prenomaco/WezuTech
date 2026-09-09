"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SiteMotion } from "@/motion/site-motion";

/** How long the skeleton takes to fade once the page is ready. */
const FADE_MS = 400;

/**
 * Gates the product page's entrance choreography behind the page actually
 * being settled.
 *
 * This page carries more decorative weight than any other — refraction
 * canvases, fractal bars, a dozen images — and mounting `SiteMotion`
 * immediately meant ScrollTrigger measured its trigger positions while all
 * of that was still loading and shifting layout. The positions it computed
 * on that first pass were stale by the time everything actually settled, so
 * reveals that should have played on scroll had already been judged "past
 * their start" and fired in a batch, reading as skipped or rushed rather
 * than choreographed.
 *
 * The real content renders and loads normally underneath from the very
 * first paint — nothing here delays that — an opaque skeleton just sits in
 * front of it until the window's `load` event (every image and font
 * resolved) plus one more frame for layout to settle. Only then does the
 * skeleton fade and the motion system mount, against a page that already
 * has its final shape.
 */
export function ProductPageShell({ children }: { readonly children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [skeletonMounted, setSkeletonMounted] = useState(true);

  useEffect(() => {
    let raf = 0;
    const settle = () => {
      raf = requestAnimationFrame(() => setReady(true));
    };
    if (document.readyState === "complete") {
      settle();
    } else {
      window.addEventListener("load", settle, { once: true });
    }
    return () => {
      window.removeEventListener("load", settle);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => setSkeletonMounted(false), FADE_MS);
    return () => clearTimeout(timer);
  }, [ready]);

  return (
    <>
      {children}
      {skeletonMounted ? <ProductSkeleton visible={!ready} /> : null}
      {ready ? <SiteMotion /> : null}
    </>
  );
}

function SkeletonBlock({ className }: { readonly className: string }) {
  return <div className={`animate-pulse rounded-[0.625rem] bg-white/10 ${className}`} />;
}

function ProductSkeleton({ visible }: { readonly visible: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[200] overflow-hidden bg-ink transition-opacity duration-[400ms] ease-out ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="h-[6.625rem] border-b border-white/5" />
      <div className="mx-auto w-full max-w-[94.5rem] px-[1.625rem] pt-[3.375rem] sm:px-[clamp(2.5rem,6.88vw,6.5rem)] lg:px-[6.5rem]">
        <div className="grid gap-10 lg:grid-cols-[40.875rem_minmax(0,1fr)] lg:gap-[3rem]">
          <div className="lg:ml-[2.5625rem] lg:pt-[1.875rem]">
            <SkeletonBlock className="h-6 w-56" />
            <SkeletonBlock className="mt-9 h-4 w-full max-w-[34.7rem]" />
            <SkeletonBlock className="mt-3 h-4 w-3/4 max-w-[34.7rem]" />
            <div className="mt-10 grid grid-cols-3 gap-2">
              <SkeletonBlock className="h-24" />
              <SkeletonBlock className="h-24" />
              <SkeletonBlock className="h-24" />
            </div>
            <div className="mt-[2.125rem] flex gap-2">
              <SkeletonBlock className="h-11 w-36" />
              <SkeletonBlock className="h-11 w-36" />
            </div>
          </div>
          <SkeletonBlock className="h-[25rem] w-full" />
        </div>
      </div>
    </div>
  );
}
