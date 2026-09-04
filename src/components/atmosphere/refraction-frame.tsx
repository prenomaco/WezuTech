import type { CSSProperties, ReactNode } from "react";
import { refractionLayers } from "@/lib/design/refraction";

/**
 * A background frame carrying Figma's pattern-refraction shader.
 *
 * The frame clips its glow the way Figma's frames do, then the whole raster is
 * displaced. Order matters: displacing first and clipping after would drag the
 * bands past the frame edge.
 *
 * The shader's `pixelWrapMode` is 0 — samples outside the frame come back
 * transparent — which is also what the stack does, since each copy is the same
 * glow and there is nothing beyond it to slide in.
 *
 * The displacement is not a filter. With the shader's angle at 0 the effect
 * collapses to `out(x) = in(x + dx(x))`, a purely horizontal remap, and
 * {@link refractionLayers} rebuilds that from four copies of the frame at fixed
 * offsets, weighted by `repeating-linear-gradient` masks on the ridge period
 * and added together inside an isolating group. Gradients, transforms and a
 * blend are things a compositor can do, so each frame is rastered once and
 * scrolling merely moves the result.
 *
 * It used to be an `feImage` feeding an `feDisplacementMap`. No engine
 * implements `feDisplacementMap` on the compositor, so Gecko rendered the
 * filtered subtree as a CPU blob, tiled it, and re-ran the graph as the
 * displayport moved — measured over a scripted APZ wheel scroll of this page in
 * Zen at DPR 2, content paint was 107ms per paint with the filter and 1.2ms
 * without, which is 93% of the page's scrolling cost and the whole of the
 * stutter on a built-in display. Chrome hid it by rastering the filter once.
 *
 * The frames also no longer raster at a divided resolution. That existed to
 * keep a filter's device-pixel result small on a 2x screen, and Gecko sizes a
 * filter surface by the element's own transform, so the half-size path bought
 * it nothing anyway: 107ms per paint against 90ms forced back to 1x. With the
 * filter gone there is no surface to divide.
 *
 * These frames do not take part in the parallax.
 *
 * There is no screen blend. Figma marks the group `screen`, but its frames are
 * transparent, so the blend has nothing to act on and the result composites
 * normally over the page — which is also what the export shows. Measured
 * against it, screening is 4.70 mean error and compositing normally is 4.42,
 * and normal costs the compositor no backdrop read.
 */
interface RefractionFrameProps {
  readonly id: string;
  readonly box: {
    readonly left: number;
    readonly top: number;
    readonly width: number;
    readonly height: number;
  };
  /** Frame 7 draws the same tile mirrored down the page. */
  readonly flipY?: boolean;
  /** Frame width to place against proportionally, so the tile can stretch. */
  readonly relativeTo?: number;
  readonly children: ReactNode;
}

export function RefractionFrame({ id, box, flipY, relativeTo, children }: RefractionFrameProps) {
  const across = (value: number) =>
    relativeTo === undefined ? value : `${(value / relativeTo) * 100}%`;
  const layers = refractionLayers(box.width);

  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: across(box.left), top: box.top, width: across(box.width), height: box.height }}
    >
      <div className="size-full" style={{ transform: flipY ? "scaleY(-1)" : undefined }}>
        <div className="refraction-stack relative isolate size-full overflow-hidden">
          {layers.map((layer) => (
            /* The mask names columns of the frame, so it has to sit on an
               element the shift does not move — a mask is applied in the
               element's own space, and putting both on one element would drag
               each copy's stripes along with it and land every copy on a
               different phase. */
            <div
              className="absolute inset-0"
              key={`${id}-${layer.offset}`}
              style={
                {
                  maskImage: layer.mask,
                  WebkitMaskImage: layer.mask,
                  mixBlendMode: "plus-lighter",
                } as CSSProperties
              }
            >
              <div
                className="absolute inset-0"
                style={{ transform: `translateX(${(-layer.offset).toFixed(4)}px)` }}
              >
                {children}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
