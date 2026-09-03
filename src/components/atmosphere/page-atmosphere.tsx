import { GlowField, type GlowRect } from "@/components/atmosphere/glow-field";
import { PageRim } from "@/components/atmosphere/page-rim";
import type { GlowVectorName } from "@/lib/design/glow-vectors";

/**
 * The page's light, as one continuous field.
 *
 * Figma places its glow groups against the 1512 x 3984 frame, spanning section
 * boundaries. Reproducing them per section means each one clips its own light
 * and the joins show as hard horizontal seams, so this layer is mounted once
 * for the whole page and the sections sit above it.
 *
 * The two large groups are the design's own vectors. The border that runs down
 * both frame edges is `PageRim`, built from the render's own colour ramp.
 */

interface GlowPlacement {
  readonly id: string;
  readonly vector: GlowVectorName;
  readonly rect: GlowRect;
  readonly opacity?: number;
  readonly depth: number;
}

/**
 * Rects are the exported SVG bounds — the group's box plus the room its blur
 * needs — from the `inset` Figma reports:
 *   Group 12 (hero)   node -64.4, -94.0  1656.9 x 1103.0, inset -10.19% -6.78%
 *   Group 13 (footer) node -166,  3524   1852   x 1101.9, inset  -9.98% -5.94%
 */
const GLOWS: readonly GlowPlacement[] = [
  {
    id: "hero",
    vector: "field",
    rect: { x: -176.7, y: -206.4, width: 1881.69, height: 1327.81 },
    /* Chrome's Gaussian spreads a little wider than Figma's, leaving the hero
       band ~12/255 hot at the edges. The rim is screen-composited and can only
       add, so the correction has to happen here. */
    opacity: 0.94,
    depth: 30,
  },
  {
    id: "footer",
    vector: "footer",
    rect: { x: -276, y: 3414, width: 2072, height: 1321.91 },
    depth: 20,
  },
];

export function PageAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-clip" aria-hidden="true">
      {GLOWS.map((glow) => (
        <GlowField
          depth={glow.depth}
          id={glow.id}
          key={glow.id}
          opacity={glow.opacity}
          rect={glow.rect}
          vector={glow.vector}
        />
      ))}


      <PageRim />

      {/* Vertical light rays run the full page, not just the hero: measured at
          a 20px period and ~7.5/255 peak-to-peak at both y=150 and y=2600. */}
      <div className="glow-rays absolute inset-0" />
    </div>
  );
}
