import type { CSSProperties } from "react";
import { GlowField, type GlowRect } from "@/components/atmosphere/glow-field";
import type { GlowVectorName } from "@/lib/design/glow-vectors";

/**
 * The page's light, as one continuous field.
 *
 * Figma places its glow groups against the 1512 x 3984 frame, spanning section
 * boundaries. Reproducing them per section means each one clips its own light
 * and the joins show as hard horizontal seams, so this layer is mounted once
 * for the whole page and the sections sit above it.
 *
 * The two large groups are the design's own vectors. The long edge streaks
 * (Groups 17 / 21 / 22) are gradients instead: they are narrow rims that decay
 * inward over a few hundred pixels, and the field vector is far too broad to
 * stand in for them.
 */

const GLOW_TONE = {
  core: "148 176 201",
  pale: "196 219 236",
} as const;

const FRAME_WIDTH = 1512;

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
    depth: 30,
  },
  {
    id: "footer",
    vector: "footer",
    rect: { x: -276, y: 3414, width: 2072, height: 1321.91 },
    depth: 20,
  },
];

interface StreakSpec {
  readonly id: string;
  readonly side: "left" | "right";
  /** Frame coordinates and inward reach, in frame pixels. */
  readonly top: number;
  readonly height: number;
  readonly reach: number;
  readonly tone: keyof typeof GLOW_TONE;
  /** Peak alpha at the frame edge. */
  readonly alpha: number;
  readonly depth: number;
}

/**
 * Measured off the render band by band. The upper pair is left-dominant — at
 * y=845 the left edge reads 68 against 9 on the right — while the band around
 * y=2414 is symmetric.
 */
const STREAKS: readonly StreakSpec[] = [
  { id: "upper-left", side: "left", top: 620, height: 620, reach: 560, tone: "core", alpha: 0.52, depth: 74 },
  { id: "upper-right", side: "right", top: 900, height: 460, reach: 420, tone: "core", alpha: 0.24, depth: 58 },
  { id: "mid-left", side: "left", top: 2330, height: 330, reach: 420, tone: "core", alpha: 0.6, depth: 96 },
  { id: "mid-right", side: "right", top: 2330, height: 330, reach: 420, tone: "core", alpha: 0.57, depth: 96 },
];

function streakStyle(streak: StreakSpec): CSSProperties {
  return {
    [streak.side]: 0,
    "--streak-top": `${streak.top}px`,
    "--streak-height": `${streak.height}px`,
    "--streak-reach": `${(streak.reach / FRAME_WIDTH) * 100}%`,
    "--streak-rgb": GLOW_TONE[streak.tone],
    "--streak-alpha": streak.alpha,
    "--streak-direction": streak.side === "left" ? "to right" : "to left",
  } as CSSProperties;
}

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

      {STREAKS.map((streak) => (
        <span
          className="glow-streak"
          data-glow-depth={streak.depth}
          key={streak.id}
          style={streakStyle(streak)}
        />
      ))}

      {/* Vertical light rays run the full page, not just the hero: measured at
          a 20px period and ~7.5/255 peak-to-peak at both y=150 and y=2600. */}
      <div className="glow-rays absolute inset-0" />
    </div>
  );
}
