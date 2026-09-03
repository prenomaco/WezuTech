import type { ReactNode } from "react";
import { DISPLACEMENT_SCALE, refractionMapUri } from "@/lib/design/refraction";

/**
 * A background frame carrying Figma's pattern-refraction shader.
 *
 * The frame clips its glow the way Figma's frames do, then the whole raster is
 * displaced. Order matters: displacing first and clipping after would drag the
 * bands past the frame edge.
 *
 * The shader's `pixelWrapMode` is 0 — samples outside the frame come back
 * transparent — which is also what an SVG filter does outside its region, so
 * the region is pinned to the frame box rather than the default overhang.
 *
 * These frames do not take part in the parallax. `feDisplacementMap` has no CSS
 * equivalent, so it stays an SVG filter graph, and Chrome rasters those on the
 * CPU — over a 1545 x 992 surface. Moving the element invalidates that raster,
 * so scrolling re-ran the displacement every frame and the page advanced in
 * steps. Left still, it is rastered once and the tiles are simply scrolled.
 * The drift the design asks for comes from the streaks and the hero subject,
 * which are cheap to move.
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
  readonly children: ReactNode;
}

export function RefractionFrame({ id, box, flipY, children }: RefractionFrameProps) {
  const filterId = `refraction-${id}`;

  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
    >
      <svg aria-hidden="true" className="absolute size-0">
        <defs>
          <filter
            colorInterpolationFilters="sRGB"
            filterUnits="objectBoundingBox"
            height="1"
            id={filterId}
            primitiveUnits="userSpaceOnUse"
            width="1"
            x="0"
            y="0"
          >
            <feImage
              height={box.height}
              href={refractionMapUri(box.width)}
              preserveAspectRatio="none"
              result="ridges"
              width={box.width}
              x="0"
              y="0"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="ridges"
              scale={DISPLACEMENT_SCALE}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <div className="size-full" style={{ transform: flipY ? "scaleY(-1)" : undefined }}>
        <div className="relative size-full overflow-hidden" style={{ filter: `url(#${filterId})` }}>
          {children}
        </div>
      </div>
    </div>
  );
}
