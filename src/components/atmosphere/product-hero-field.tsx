"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { renderProductHeroField } from "@/lib/design/render-product-hero-field";

interface ProductHeroFieldProps {
  readonly width: number;
  readonly height: number;
  /** The DOM-composited version, shown until the canvas has painted. */
  readonly children: ReactNode;
}

function observeField(
  canvas: HTMLCanvasElement,
  props: { width: number; height: number },
  ready: (value: boolean) => void,
) {
  let controller = new AbortController();
  const draw = () => {
    controller.abort();
    controller = new AbortController();
    const { signal } = controller;
    void renderProductHeroField(canvas, props.width, props.height, signal)
      .then((painted) => {
        if (painted && !signal.aborted) ready(true);
      })
      .catch(() => {
        if (!signal.aborted) ready(false);
      });
  };
  const lost = () => {
    controller.abort();
    ready(false);
  };
  canvas.addEventListener("contextlost", lost);
  canvas.addEventListener("contextrestored", draw);
  draw();
  return () => {
    controller.abort();
    canvas.removeEventListener("contextlost", lost);
    canvas.removeEventListener("contextrestored", draw);
  };
}

/**
 * The hero ellipse group (Figma's "BG Fractal Gradience"), simulated the same
 * way Home and About's glows are — vector data owned in code, blurred and
 * composited on a canvas at runtime — rather than six downloaded SVGs
 * positioned with CSS `mix-blend-mode`. Falls back to that DOM version
 * (passed as `children`) until the canvas has painted.
 */
export function ProductHeroField({ width, height, children }: ProductHeroFieldProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!canvas.current) return;
    return observeField(canvas.current, { width, height }, setReady);
  }, [width, height]);
  return (
    <>
      {!ready && children}
      <canvas
        aria-hidden="true"
        className="absolute inset-0 block size-full mix-blend-hard-light"
        data-ready={ready}
        ref={canvas}
        style={{ display: ready ? "block" : "none" }}
      />
    </>
  );
}
