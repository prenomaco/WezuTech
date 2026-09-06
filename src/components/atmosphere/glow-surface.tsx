"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  GLOW_VECTORS,
  type GlowVectorName,
  type GlowVectorSpec,
} from "@/lib/design/glow-vectors";
import { glowSurfaceGeometry, renderGlow } from "@/lib/design/render-glow";

interface GlowSurfaceProps {
  readonly vector: GlowVectorName;
  readonly width: number;
  readonly height: number;
}

/** The SVG fallback uses the same padded geometry, never a live CSS filter. */
function GlowFallback({ vector, width, height }: GlowSurfaceProps) {
  const id = useId();
  const spec: GlowVectorSpec = GLOW_VECTORS[vector];
  const box = glowSurfaceGeometry(spec, width, height);
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 block size-full"
      preserveAspectRatio="none"
      viewBox={`${-box.padding} ${-box.padding} ${box.width} ${box.height}`}
    >
      <defs>
        <filter
          id={id}
          filterUnits="userSpaceOnUse"
          x={-box.padding}
          y={-box.padding}
          width={box.width}
          height={box.height}
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation={box.blur} />
        </filter>
      </defs>
      <g filter={`url(#${id})`} opacity={spec.opacity ?? 1}>
        <g transform={`scale(${width / spec.width} ${height / spec.height})`}>
          {spec.shapes.map(({ d, fill }) => (
            <path d={d} fill={fill} key={d.slice(0, 24)} />
          ))}
        </g>
      </g>
    </svg>
  );
}

function observeGlow(
  canvas: HTMLCanvasElement,
  props: GlowSurfaceProps,
  ready: (value: boolean) => void,
) {
  let controller = new AbortController();
  const draw = () => {
    controller.abort();
    controller = new AbortController();
    const { signal } = controller;
    void renderGlow(canvas, props.vector, props.width, props.height, signal)
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

export function GlowSurface({ vector, width, height }: GlowSurfaceProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!canvas.current) return;
    return observeGlow(canvas.current, { vector, width, height }, setReady);
  }, [vector, width, height]);
  return (
    <>
      {!ready && <GlowFallback vector={vector} width={width} height={height} />}
      <canvas
        aria-hidden="true"
        className="absolute inset-0 block size-full"
        data-glow-surface={vector}
        data-ready={ready}
        ref={canvas}
      />
    </>
  );
}
