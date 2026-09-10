"use client";

import { useEffect } from "react";

/**
 * In-page anchors, scrolled by us rather than by the fragment navigation.
 *
 * A plain `<a href="#products">` asks the browser to scroll to the fragment,
 * and with `scroll-behavior: smooth` that scroll is a browser-owned animation
 * the page cannot see. It is also cancellable, and this page cancels it: the
 * first time a reveal `ScrollTrigger` between the viewport and the target
 * fires, the animation stops dead — "Products" from the top of the home page
 * halted around y=660 of the 1440 it was aimed at, and "Contact Us" halted
 * about a fifth of the way to the form. Scroll past the section once so its
 * triggers have already run and the same link lands exactly where it should,
 * which is what makes it look intermittent rather than broken.
 *
 * `window.scrollTo` with the same target is not affected, so the fix is to
 * stop asking the browser to do it. We take the click, work out where the
 * element is, and drive the scroll ourselves.
 */

/** Whether the click is the plain left-click that means "follow this link". */
function isPlainClick(event: MouseEvent): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

/** The element a fragment points at, if this document has one. */
function targetFor(hash: string): HTMLElement | null {
  if (hash.length < 2) return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    /* A malformed escape in the fragment is not ours to resolve. */
    return null;
  }
}

/**
 * Where the page has to sit for `element` to be at the top of the viewport.
 *
 * `scroll-margin-top` is read rather than assumed: it is the property that
 * exists to hold an anchor clear of a fixed header, so anything that sets it
 * later gets honoured here without this file changing.
 */
function scrollTopFor(element: HTMLElement): number {
  const margin = Number.parseFloat(getComputedStyle(element).scrollMarginTop);
  const top =
    element.getBoundingClientRect().top +
    window.scrollY -
    (Number.isFinite(margin) ? margin : 0);
  return Math.max(0, Math.round(top));
}

function scrollToElement(element: HTMLElement): void {
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";

  /*
   * Two frames late, on purpose. The mobile menu closes by React state and
   * unlocks `body { overflow: hidden }` on the way out, so a scroll issued
   * inside the click handler is issued against a body that cannot scroll yet.
   * Waiting for the commit costs a frame nobody can see.
   */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollTopFor(element), behavior });
    });
  });
}

/**
 * The fragment a page was opened at, honoured once the document exists.
 *
 * "Products" in the header is `/#products`, so pressing it from About is a
 * real navigation and the home page loads with the fragment already in the
 * URL. The browser's own attempt at that scroll happens before the section is
 * on the page and it lands at the top instead, which reads as the link doing
 * nothing at all. This puts it where the URL says.
 *
 * Only on a fresh navigation. A reload or a back/forward carries a restored
 * scroll position that belongs to the reader, not to the fragment.
 */
function useOpeningFragment(): void {
  useEffect(() => {
    const [entry] = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    if (entry && entry.type !== "navigate") return;

    const element = targetFor(window.location.hash);
    if (!element) return;

    let landed = -1;
    const settle = () => {
      /* Nothing to correct once the reader has moved off the mark
         themselves — a late-loading asset must not pull them back. */
      if (landed >= 0 && Math.abs(window.scrollY - landed) > 4) return;
      landed = scrollTopFor(element);
      window.scrollTo({ top: landed, behavior: "auto" });
    };

    /* Arriving at a fragment means being there, so this one does not animate. */
    const frame = requestAnimationFrame(() => requestAnimationFrame(settle));

    /* Once more when the last asset has landed, in case it changed a height
       above the target between then and now. */
    const onLoad = () => requestAnimationFrame(settle);
    if (document.readyState !== "complete") {
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", onLoad);
    };
  }, []);
}

export function AnchorScroll() {
  useOpeningFragment();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!isPlainClick(event)) return;

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor || anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      /* Same document only. `/#products` from `/about` is a real navigation
         and has to stay one, so it is matched on path, not just on hash. */
      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname ||
        url.search !== window.location.search
      )
        return;

      const element = targetFor(url.hash);
      if (!element) return;

      event.preventDefault();
      /* `pushState` moves the address bar without scrolling, so the URL still
         says where you are and there is no second scroll to race ours. It
         does not fire `hashchange` either, so the listener below cannot see
         its own writes. */
      if (url.hash !== window.location.hash) {
        window.history.pushState(null, "", url.hash);
      }
      scrollToElement(element);
    };

    /* Back and forward still arrive as a fragment navigation, and the browser
       will make its own attempt at the scroll. Repeating it lands it. */
    const onHashChange = () => {
      const element = targetFor(window.location.hash);
      if (element) scrollToElement(element);
    };

    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return null;
}
