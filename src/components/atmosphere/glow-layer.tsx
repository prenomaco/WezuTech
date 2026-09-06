import type { CSSProperties } from "react";
import {
  GLOW_VECTORS,
  type GlowVectorName,
  type GlowVectorSpec,
} from "@/lib/design/glow-vectors";
import { designPx } from "@/lib/design/units";
import { GlowSurface } from "@/components/atmosphere/glow-surface";
import { glowSurfaceGeometry } from "@/lib/design/render-glow";

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

export interface GlowLayerProps {
  readonly vector: GlowVectorName;
  /** The node's box, in the coordinates of whatever contains it. */
  readonly box: GlowBox;
  /**
   * Size to draw the export at, when the design instances it at something
   * other than the size it was exported from — the 402 frame reuses the same
   * groups at roughly a third of the scale.
   */
  readonly render?: { readonly width: number; readonly height: number };
  /** Parallax travel in design pixels, read by the motion layer. */
  readonly depth?: number;
  /**
   * Width to place horizontally against as a percentage — see the same option
   * on {@link RefractionFrame}. Only the dashboard shell uses it.
   */
  readonly relativeTo?: number;
}

export function GlowLayer({
  vector,
  box,
  render,
  depth,
  relativeTo,
}: GlowLayerProps) {
  const spec: GlowVectorSpec = GLOW_VECTORS[vector];
  const width = render?.width ?? spec.width;
  const height = render?.height ?? spec.height;
  const surface = glowSurfaceGeometry(spec, width, height);
  const left = box.left + (box.width - width) / 2 - surface.padding;
  const top = box.top + (box.height - height) / 2 - surface.padding;

  return (
    <div
      className="pointer-events-none absolute origin-top-left"
      data-glow-depth={depth}
      style={{
        left:
          relativeTo === undefined
            ? designPx(left)
            : `${(left / relativeTo) * 100}%`,
        top: designPx(top),
        width:
          relativeTo === undefined
            ? designPx(surface.width)
            : `${(surface.width / relativeTo) * 100}%`,
        height: designPx(surface.height),
        /* Read by the scroll-driven drift in `globals.css`. It animates the
           `translate` property rather than `transform`, which this element is
           already using for its raster scale. */
        ...(depth
          ? ({ "--glow-depth": designPx(depth) } as CSSProperties)
          : null),
      }}
    >
      <GlowSurface vector={vector} width={width} height={height} />
    </div>
  );
}
