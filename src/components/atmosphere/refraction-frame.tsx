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
 * Three nested elements rather than one, because each has to stay out of the
 * others' way: parallax moves the outer one, the flip belongs outside the
 * shader exactly as the design nests it, and the innermost is the only thing
 * carrying the filter. Animating anything *inside* a filtered element would
 * make the browser re-run the displacement every frame.
 *
 * The screen blend sits on the outer element rather than on the glow inside it.
 * A CSS filter isolates its subtree, so an inner `mix-blend-mode` can only see
 * the frame's own transparent backdrop — which matters because Frames 6 and 7
 * overlap by 160px and have to add there. Figma's frames do not isolate, so
 * the group blends against everything beneath it; screening the whole frame
 * reproduces that, and is a no-op difference for the frames that stand alone.
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
  /** Parallax travel in pixels, read by the motion layer. */
  readonly depth?: number;
  readonly children: ReactNode;
}

export function RefractionFrame({ id, box, flipY, depth, children }: RefractionFrameProps) {
  const filterId = `refraction-${id}`;

  return (
    <div
      className="pointer-events-none absolute mix-blend-screen"
      data-glow-depth={depth}
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
