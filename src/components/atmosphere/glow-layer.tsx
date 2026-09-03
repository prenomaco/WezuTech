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
  /**
   * Size to draw the export at, when the design instances it at something
   * other than the size it was exported from — the 402 frame reuses the same
   * groups at roughly a third of the scale.
   */
  readonly render?: { readonly width: number; readonly height: number };
  /** Figma screens this group over its backdrop. */
  readonly screen?: boolean;
  /** Parallax travel in pixels, read by the motion layer. */
  readonly depth?: number;
}

export function GlowLayer({ vector, id, box, render, screen, depth }: GlowLayerProps) {
  const spec = GLOW_VECTORS[vector];
  const filterId = `glow-${id}`;
  const width = render?.width ?? spec.width;
  const height = render?.height ?? spec.height;

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute${screen ? " mix-blend-screen" : ""}`}
      data-glow-depth={depth}
      fill="none"
      height={height}
      preserveAspectRatio="none"
      style={{
        left: box.left + (box.width - width) / 2,
        top: box.top + (box.height - height) / 2,
      }}
      viewBox={`0 0 ${spec.width} ${spec.height}`}
      width={width}
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
