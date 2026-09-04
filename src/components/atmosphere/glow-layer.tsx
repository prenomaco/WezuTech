import type { CSSProperties } from "react";
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
 * These layers cover 15.2 megapixels against a 1.4 megapixel viewport, at
 * radii of 39 to 56px. A filter cannot be rasterised a tile at a time, so the
 * whole result has to be produced the moment any part of the element comes
 * into view, and a 2.7 megapixel surface with a 55px Gaussian lands inside a
 * single frame — which is what made scrolling arrive in blocks.
 *
 * A Gaussian of radius r holds no detail finer than r, so rasterising below
 * its own radius costs nothing visible: at a half scale the area falls by four
 * and the radius by two, taking 15.2 megapixels of 56px blur down to 3.8 of
 * 28px, and the upscale is bilinear over an image with no high frequencies
 * left in it.
 *
 * It was a quarter while the refraction frames were an SVG filter and the page
 * had no budget to spare. That filter is gone, so the halves are affordable
 * and the glow's gradients resolve visibly better where they meet an edge.
 */
const RASTER_SCALE = 2;

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
  /**
   * Frame width to express horizontal placement against, as a percentage.
   *
   * The design is a 1512 frame, but the light is meant to reach the edges of
   * whatever it is shown on — the border glow was the whole point of it. So the
   * layers that span the frame are placed proportionally and stretch with the
   * viewport, while the edge streaks stay pinned to the edge they belong to.
   * Left unset, placement is in design pixels.
   */
  readonly relativeTo?: number;
}

export function GlowLayer({ vector, box, render, depth, relativeTo }: GlowLayerProps) {
  const spec = GLOW_VECTORS[vector];
  const width = render?.width ?? spec.width;
  const height = render?.height ?? spec.height;
  const left = box.left + (box.width - width) / 2;
  const top = box.top + (box.height - height) / 2;
  const across = (value: number) =>
    relativeTo === undefined ? value : `${(value / relativeTo) * 100}%`;

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
        left: across(left),
        top,
        width:
          relativeTo === undefined
            ? width / RASTER_SCALE
            : `calc(${(width / relativeTo) * 100}% / ${RASTER_SCALE})`,
        height: height / RASTER_SCALE,
        transform: `scale(${RASTER_SCALE})`,
        /* Read by the scroll-driven drift in `globals.css`. It animates the
           `translate` property rather than `transform`, which this element is
           already using for its raster scale. */
        ...(depth ? ({ "--glow-depth": `${depth}px` } as CSSProperties) : null),
      }}
    >
      <svg
        aria-hidden="true"
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        style={{ filter: `blur(${blur.toFixed(4)}px)` }}
        viewBox={`0 0 ${spec.width} ${spec.height}`}
      >
        {spec.shapes.map((shape) => (
          <path d={shape.d} fill={shape.fill} key={shape.d.slice(0, 24)} />
        ))}
      </svg>
    </div>
  );
}
