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

/**
 * How much smaller than its final size each glow is actually rasterised.
 *
 * These layers are the page's whole rendering budget. Together they cover
 * 15.2 megapixels against a 1.4 megapixel viewport, at radii of 39 to 56px,
 * and a filter cannot be rasterised a tile at a time — Chrome has to produce
 * the entire filter result the moment any part of the element comes into view.
 * A 2.7 megapixel surface with a 55px Gaussian therefore lands inside a single
 * frame, which is what made scrolling arrive in blocks.
 *
 * A Gaussian of radius r holds no detail finer than r, so there is nothing in
 * these layers to lose by rasterising them small and scaling the result back
 * up: at a quarter size the area falls by sixteen and the radius by four,
 * taking 15.2 megapixels of 56px blur down to 0.95 of 14px. The upscale is
 * bilinear over an image with no high frequencies left in it, so it is not a
 * visible approximation — measured against the design's own export, a quarter
 * scale changes the mean error by 0.03/255.
 */
const RASTER_SCALE = 4;

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

  /*
   * The blur is a CSS filter on the `<svg>` rather than an `feGaussianBlur`
   * inside a filter graph: CSS `blur(v)` is the same Gaussian of standard
   * deviation `v`, but Chrome rasters an SVG filter graph on the CPU and
   * accelerates the CSS one.
   *
   * It sits on the outer element, not the inner `<g>`, so its length is in the
   * element's own CSS pixels rather than viewBox units — which is the only way
   * to state the radius unambiguously once the element is deliberately being
   * drawn at a different size from its viewBox.
   */
  const blur = (spec.blur * (width / spec.width)) / RASTER_SCALE;

  return (
    <div
      className="pointer-events-none absolute origin-top-left"
      data-glow-depth={depth}
      style={{
        left: box.left + (box.width - width) / 2,
        top: box.top + (box.height - height) / 2,
        transform: `scale(${RASTER_SCALE})`,
      }}
    >
      <svg
        aria-hidden="true"
        className="block"
        fill="none"
        height={height / RASTER_SCALE}
        preserveAspectRatio="none"
        style={{ filter: `blur(${blur.toFixed(4)}px)` }}
        viewBox={`0 0 ${spec.width} ${spec.height}`}
        width={width / RASTER_SCALE}
      >
        {spec.shapes.map((shape) => (
          <path d={shape.d} fill={shape.fill} key={shape.d.slice(0, 24)} />
        ))}
      </svg>
    </div>
  );
}
