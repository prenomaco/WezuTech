import { GLOW_VECTORS, type GlowVectorName } from "@/lib/design/glow-vectors";

/**
 * One of the design's blurred glow groups.
 *
 * Figma exports each group with the room its Gaussian needs already padded
 * around it, and places the export centred on the node's own box — the padding
 * is symmetric, so the offsets in the generated code (`inset-[-10.19%_-6.78%]`
 * and friends) are just that centring expressed as percentages. Drawing the
 * export at its native size, centred, reproduces them exactly without carrying
 * a separate ratio per layer.
 */
export interface GlowBox {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

interface GlowLayerProps {
  readonly vector: GlowVectorName;
  /** Unique per instance — the blur filter is referenced by id. */
  readonly id: string;
  /** The node's box, in the coordinates of whatever contains it. */
  readonly box: GlowBox;
  /** Figma screens this group over its backdrop. */
  readonly screen?: boolean;
  /** Parallax travel in pixels, read by the motion layer. */
  readonly depth?: number;
}

export function GlowLayer({ vector, id, box, screen, depth }: GlowLayerProps) {
  const spec = GLOW_VECTORS[vector];
  const filterId = `glow-${id}`;

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute${screen ? " mix-blend-screen" : ""}`}
      data-glow-depth={depth}
      fill="none"
      height={spec.height}
      preserveAspectRatio="none"
      style={{
        left: box.left + (box.width - spec.width) / 2,
        top: box.top + (box.height - spec.height) / 2,
      }}
      viewBox={`0 0 ${spec.width} ${spec.height}`}
      width={spec.width}
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
