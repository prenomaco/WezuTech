import type { CSSProperties } from "react";
import { GLOW_VECTORS, type GlowVectorName } from "@/lib/design/glow-vectors";

const FRAME_WIDTH = 1512;

export interface GlowRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface GlowFieldProps {
  readonly vector: GlowVectorName;
  /** Unique per instance — the blur filter is referenced by id. */
  readonly id: string;
  /** Frame rect of the exported SVG, including the room its blur needs. */
  readonly rect: GlowRect;
  readonly opacity?: number;
  /** Parallax travel in pixels, read by the motion layer. */
  readonly depth?: number;
  /**
   * Width the rect's horizontal values are measured against. Defaults to the
   * 1512 frame; a tile passes its own frame width so the child scales with it.
   */
  readonly relativeTo?: number;
}

/**
 * One of the design's glow groups, placed at its frame coordinates.
 *
 * Blurred and composited with `screen`, exactly as Figma does it. Placement is
 * a percentage of the 1512 x 3984 frame so the field belongs to the page rather
 * than to a section — scoping light per section is what produces visible seams
 * at the section boundaries, since each one clips its own glow.
 */
export function GlowField({ vector, id, rect, opacity, depth, relativeTo = FRAME_WIDTH }: GlowFieldProps) {
  const spec = GLOW_VECTORS[vector];
  const filterId = `glow-${id}`;

  /* Horizontal placement scales with the frame; vertical stays in frame pixels.
     A percentage `top` would resolve against the page's own height, which the
     content decides — the field would then shift whenever the page grew. */
  const style: CSSProperties = {
    left: `${(rect.x / relativeTo) * 100}%`,
    width: `${(rect.width / relativeTo) * 100}%`,
    top: rect.y,
    height: rect.height,
    opacity,
  };

  return (
    <svg
      aria-hidden="true"
      className="glow-rayed pointer-events-none absolute mix-blend-screen"
      data-glow-depth={depth}
      fill="none"
      preserveAspectRatio="none"
      style={style}
      viewBox={`0 0 ${spec.width} ${spec.height}`}
    >
      <g filter={`url(#${filterId})`}>
        {spec.shapes.map((shape) => (
          <path d={shape.d} fill={shape.fill} key={shape.d.slice(0, 24)} />
        ))}
      </g>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height={spec.height}
          id={filterId}
          width={spec.width}
          x="0"
          y="0"
        >
          <feGaussianBlur stdDeviation={spec.blur} />
        </filter>
      </defs>
    </svg>
  );
}
