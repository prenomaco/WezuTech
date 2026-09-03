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
  /** The node's box, in the coordinates of whatever contains it. */
  readonly box: GlowBox;
  /**
   * Size to draw the export at, when the design instances it at something
   * other than the size it was exported from — the 402 frame reuses the same
   * groups at roughly a third of the scale.
   */
  readonly render?: { readonly width: number; readonly height: number };
  /** Parallax travel in pixels, read by the motion layer. */
  readonly depth?: number;
}

export function GlowLayer({ vector, box, render, depth }: GlowLayerProps) {
  const spec = GLOW_VECTORS[vector];
  const width = render?.width ?? spec.width;
  const height = render?.height ?? spec.height;
  /* The blur is a CSS filter rather than an feGaussianBlur in an SVG filter
     graph. CSS `blur(v)` is defined as a Gaussian of standard deviation `v`,
     so it is the same blur — but Chrome rasters an SVG filter graph on the CPU
     and accelerates the CSS one, and these are very large surfaces at a 39-56px
     radius. The SVG viewport clips the result exactly as the old filter region
     did, since the export already carries the room the blur needs. */
  /* In user units, so it scales with the viewBox exactly as Figma's does when
     the small frame instances the same group smaller. */
  const blur = `blur(${spec.blur}px)`;

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute"
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
      <g style={{ filter: blur }}>
        {spec.shapes.map((shape) => (
          <path d={shape.d} fill={shape.fill} key={shape.d.slice(0, 24)} />
        ))}
      </g>
    </svg>
  );
}
