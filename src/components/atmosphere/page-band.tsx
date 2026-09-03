import type { CSSProperties } from "react";
import {
  BAND_ACROSS,
  BAND_BOX,
  BAND_COLOR,
  BAND_DOWN,
} from "@/lib/design/page-band";

/**
 * The wide band of light crossing the page around y=2450.
 *
 * The colour ramp runs inward from each frame edge and a mask shapes how it
 * rises and falls down the page, so the two profiles multiply. Screen-blended
 * like the rest of the light, and modulated by the same ray pattern.
 */
function across(side: "left" | "right"): string {
  const direction = side === "left" ? "to right" : "to left";
  const stops = BAND_ACROSS.map(
    ([position, share]) => `rgb(${BAND_COLOR} / ${share}) ${position}%`,
  );
  return `linear-gradient(${direction}, ${stops.join(", ")})`;
}

const DOWN = `linear-gradient(180deg, ${BAND_DOWN.map(
  ([position, share]) => `rgb(0 0 0 / ${share}) ${position}%`,
).join(", ")})`;

function bandStyle(side: "left" | "right"): CSSProperties {
  return {
    [side]: 0,
    top: BAND_BOX.top,
    height: BAND_BOX.height,
    width: BAND_BOX.reach,
    backgroundImage: across(side),
    maskImage: `${DOWN}, var(--glow-ray-mask)`,
    maskComposite: "intersect",
    WebkitMaskImage: `${DOWN}, var(--glow-ray-mask)`,
    WebkitMaskComposite: "source-in",
  };
}

export function PageBand() {
  return (
    <>
      <div
        className="pointer-events-none absolute mix-blend-screen"
        data-glow="band"
        data-glow-depth="70"
        style={bandStyle("left")}
      />
      <div
        className="pointer-events-none absolute mix-blend-screen"
        data-glow="band"
        data-glow-depth="70"
        style={bandStyle("right")}
      />
    </>
  );
}
