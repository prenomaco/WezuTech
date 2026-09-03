import type { CSSProperties } from "react";
import {
  RIM_FALLOFF,
  RIM_LEFT,
  RIM_REACH_PX,
  RIM_RIGHT,
  type RimStop,
} from "@/lib/design/page-rim";

/**
 * The glowing border the design runs down both frame edges.
 *
 * It is one continuous ramp from the hero to the footer, not a stack of
 * per-section glows, so it is built as a single element per edge: a vertical
 * gradient carrying the sampled colour at each height, faded inward by a mask.
 * Screen-composited, which is how the design lays its light over the ink.
 */
function verticalRamp(stops: readonly RimStop[]): string {
  const parts = stops.map(([position, rgb]) => `rgb(${rgb}) ${position}%`);
  return `linear-gradient(180deg, ${parts.join(", ")})`;
}

function inwardFade(side: "left" | "right"): string {
  const direction = side === "left" ? "to right" : "to left";
  const parts = RIM_FALLOFF.map(([position, alpha]) => `rgb(0 0 0 / ${alpha}) ${position}%`);
  return `linear-gradient(${direction}, ${parts.join(", ")})`;
}

function rimStyle(side: "left" | "right", stops: readonly RimStop[]): CSSProperties {
  return {
    [side]: 0,
    width: RIM_REACH_PX,
    backgroundImage: verticalRamp(stops),
    maskImage: inwardFade(side),
    WebkitMaskImage: inwardFade(side),
  };
}

export function PageRim() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-y-0 mix-blend-screen"
        style={rimStyle("left", RIM_LEFT)}
      />
      <div
        className="pointer-events-none absolute inset-y-0 mix-blend-screen"
        style={rimStyle("right", RIM_RIGHT)}
      />
    </>
  );
}
