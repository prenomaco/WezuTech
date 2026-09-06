"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  renderRefraction,
  type RefractionDrawing,
} from "@/lib/design/render-refraction";

interface RefractionCanvasProps extends RefractionDrawing {
  readonly id: string;
  readonly children: ReactNode;
}

const RESIZE_DELAY = 120;

function paintCanvas(
  canvas: HTMLCanvasElement,
  drawing: RefractionDrawing,
  signal: AbortSignal,
  ready: (painted: boolean) => void,
) {
  void renderRefraction(canvas, drawing, signal)
    .then((painted) => {
      if (painted && !signal.aborted) ready(true);
    })
    .catch(() => {
      if (!signal.aborted) ready(false);
    });
}

function observeCanvas(
  canvas: HTMLCanvasElement,
  drawing: RefractionDrawing,
  ready: (painted: boolean) => void,
) {
  let controller = new AbortController();
  let timer: ReturnType<typeof setTimeout>;
  let lastSize = "";
  const draw = () => {
    const size = `${canvas.clientWidth}:${canvas.clientHeight}:${devicePixelRatio}`;
    if (size === lastSize || !canvas.clientWidth || !canvas.clientHeight)
      return;
    controller.abort();
    controller = new AbortController();
    paintCanvas(canvas, drawing, controller.signal, (painted) => {
      if (painted) lastSize = size;
      ready(painted);
    });
  };
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(draw, RESIZE_DELAY);
  };
  const resize = new ResizeObserver(schedule);
  resize.observe(canvas);
  window.addEventListener("resize", schedule);
  const lost = () => {
    controller.abort();
    lastSize = "";
    ready(false);
  };
  canvas.addEventListener("contextlost", lost);
  canvas.addEventListener("contextrestored", draw);
  draw();
  return () => {
    controller.abort();
    resize.disconnect();
    window.removeEventListener("resize", schedule);
    clearTimeout(timer);
    canvas.removeEventListener("contextlost", lost);
    canvas.removeEventListener("contextrestored", draw);
  };
}

export function RefractionCanvas({
  id,
  children,
  ...drawing
}: RefractionCanvasProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const { frame, glow, flipY, mirrorY, bleed, phaseOffset } = drawing;
  useEffect(() => {
    if (!canvas.current) return;
    return observeCanvas(
      canvas.current,
      { frame, glow, flipY, mirrorY, bleed, phaseOffset },
      setReady,
    );
  }, [frame, glow, flipY, mirrorY, bleed, phaseOffset]);

  return (
    <>
      {!ready && children}
      <canvas
        aria-hidden="true"
        /* About's frame centre is 60.5 design pixels left of the page centre.
           A 64px gutter on both sides covers that offset without moving the
           source art. A bare 100vw canvas exposed a strip on overlay scrollbars. */
        className={`absolute top-0 h-full ${bleed ? "left-1/2 w-[max(100%,calc(100vw_+_8rem))] -translate-x-1/2" : "left-0 w-full"}`}
        data-refraction={id}
        data-ready={ready}
        ref={canvas}
      />
    </>
  );
}
