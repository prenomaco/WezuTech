import type { CSSProperties } from "react";
import {
  atmosphereField,
  glowPalette,
  type AtmosphereZone,
  type GlowSpec,
} from "@/lib/design/atmosphere";

const VARIANT_CLASS: Record<GlowSpec["variant"], string> = {
  wash: "glow glow-wash",
  edge: "glow glow-edge",
  comet: "glow glow-comet",
  bloom: "glow glow-bloom",
  striations: "glow glow-striations",
};

/** How far a glow reaches past the frame edge, so only its falloff is seen. */
const EDGE_OVERHANG = "-2%";
const COMET_INSET = "3%";

function horizontalPlacement(glow: GlowSpec): CSSProperties {
  // A wash spans the full frame; the gradient itself carries the falloff.
  if (glow.variant === "wash" || glow.variant === "striations") return { left: 0 };
  if (glow.variant === "comet") {
    return glow.side === "right" ? { right: COMET_INSET } : { left: COMET_INSET };
  }
  if (glow.side === "right") return { right: EDGE_OVERHANG };
  if (glow.side === "left") return { left: EDGE_OVERHANG };
  return { left: "50%", transform: "translateX(-50%)" };
}

function glowStyle(glow: GlowSpec): CSSProperties {
  return {
    ...horizontalPlacement(glow),
    "--glow-top": glow.top,
    "--glow-height": glow.height,
    "--glow-width": glow.width,
    "--glow-rgb": glowPalette[glow.tone],
    "--glow-alpha": glow.alpha,
    ...(glow.anchorX ? { "--glow-anchor-x": glow.anchorX } : {}),
    ...(glow.anchorY ? { "--glow-anchor-y": glow.anchorY } : {}),
    ...(glow.blur ? { "--glow-blur": glow.blur } : {}),
    ...(glow.rotate ? { "--glow-rotate": glow.rotate } : {}),
    ...(glow.opacity ? { "--glow-opacity": glow.opacity } : {}),
    ...(glow.band ? { "--glow-band": glow.band } : {}),
    ...(glow.radiusX ? { "--glow-radius-x": glow.radiusX } : {}),
    ...(glow.radiusY ? { "--glow-radius-y": glow.radiusY } : {}),
  } as CSSProperties;
}

/**
 * Renders the light field for one zone. Purely decorative and inert: it sits
 * behind content, ignores pointer events, and is hidden from assistive tech.
 *
 * `data-glow-depth` is read by the parallax motion scene — the component itself
 * stays a server component and ships no JavaScript.
 */
export function Atmosphere({ zone }: { zone: AtmosphereZone }) {
  return (
    <div className="atmosphere" aria-hidden="true" data-atmosphere={zone}>
      {atmosphereField[zone].map((glow) => (
        <span
          key={glow.id}
          className={VARIANT_CLASS[glow.variant]}
          style={glowStyle(glow)}
          data-glow-depth={glow.depth}
        />
      ))}
    </div>
  );
}
