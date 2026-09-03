import type { CSSProperties, ReactNode } from "react";
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
 * CPU — 3.6 megapixels across the three of them, against a 1.4 megapixel
 * viewport. Moving them re-ran the displacement on every scroll frame, which is
 * what made the page advance in steps. Left still, each is rastered once and
 * the tiles are simply scrolled.
 *
 * They are rasterised at CSS resolution rather than at the display's. A
 * filter's result is produced in device pixels, so a 2x screen does four times
 * the area for the same layer: measured over an identical scripted scroll of
 * the landing page, the compositor's own ScrollLayer work was 94ms across 110
 * frames at 1x and 350ms across 109 at 2x — the same frames, 3.7x the time.
 * That is the whole of the difference between this page being smooth on an
 * external monitor and stepping on a laptop's built-in screen.
 *
 * So a 2x display draws the frame at half size and scales the result back up,
 * which is exactly what the 1x display already renders and what does not
 * stutter. The content inside is counter-scaled so its coordinates stay in
 * design pixels, and the ridge period and displacement are divided to match,
 * since both are measured in the filtered element's own user units. The
 * variants are switched by a media query rather than by reading
 * `devicePixelRatio`, which would make the whole background tree client-side
 * for one number.
 *
 * Unlike the glow, they are *not* rasterised below that. The glow is a Gaussian and
 * holds no detail to lose, but these ridges are the one piece of high-frequency
 * detail in the background, and the displacement is a sawtooth with a sharp
 * reset inside every 59px. Rasterising at half size and scaling back up halves
 * the banding's amplitude — measured across the hero, the residual after
 * detrending falls from 5.93 to 2.80 — because the resample smooths exactly the
 * steep part of the ramp that produces the seams. The 3.6 megapixels stay.
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

/**
 * How wide the ridge ramp is drawn.
 *
 * The frame stretches with the viewport, but `feImage` is placed in the
 * element's own pixels, so a ramp only as wide as the design frame would run
 * out part-way across a wider one. Drawing it well past any plausible viewport
 * costs nothing — it is a tiled gradient — and keeps the ridges on their 59.2px
 * pitch rather than stretching with the frame.
 */
const RAMP_COVER = 4000;

/** The divisors a display might need. 3x exists; anything higher is capped. */
const RASTER_DIVISORS = [1, 2, 3] as const;

export function RefractionFrame({ id, box, flipY, relativeTo, children }: RefractionFrameProps) {
  const filterId = `refraction-${id}`;
  const across = (value: number) =>
    relativeTo === undefined ? value : `${(value / relativeTo) * 100}%`;

  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: across(box.left), top: box.top, width: across(box.width), height: box.height }}
    >
      <svg aria-hidden="true" className="absolute size-0">
        <defs>
          {RASTER_DIVISORS.map((divisor) => (
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="objectBoundingBox"
              height="1"
              id={`${filterId}-${divisor}x`}
              key={divisor}
              primitiveUnits="userSpaceOnUse"
              width="1"
              x="0"
              y="0"
            >
              <feImage
                height={box.height / divisor}
                href={refractionMapUri(box.width, RAMP_COVER, divisor)}
                preserveAspectRatio="none"
                result="ridges"
                width={RAMP_COVER}
                x="0"
                y="0"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="ridges"
                scale={DISPLACEMENT_SCALE / divisor}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          ))}
        </defs>
      </svg>
      <div className="size-full" style={{ transform: flipY ? "scaleY(-1)" : undefined }}>
        <div
          className="refraction-raster relative overflow-hidden"
          style={
            {
              "--refraction-filter": `url(#${filterId}-1x)`,
              "--refraction-filter-2x": `url(#${filterId}-2x)`,
              "--refraction-filter-3x": `url(#${filterId}-3x)`,
            } as CSSProperties
          }
        >
          <div className="refraction-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
