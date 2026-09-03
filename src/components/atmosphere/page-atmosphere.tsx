import { GlowField, type GlowRect } from "@/components/atmosphere/glow-field";
import { PageBand } from "@/components/atmosphere/page-band";
import { PageRim } from "@/components/atmosphere/page-rim";
import type { GlowVectorName } from "@/lib/design/glow-vectors";

/**
 * The page's light, as one continuous field.
 *
 * Figma places its glow against the 1512 x 3984 frame, spanning section
 * boundaries. Reproducing it per section means each one clips its own light and
 * the joins show as hard horizontal seams, so this layer is mounted once for
 * the whole page and the sections sit above it.
 */

const FRAME_WIDTH = 1512;

/**
 * "BG Fractal Gradience" (node 361:46) is the design's reusable background
 * tile: a 1545 x 992.19 frame holding Group 12, which sits at (-64.375,
 * -94.008) inside it and measures 1656.89 x 1103.00. The page instances that
 * tile three times — Frame 5 behind the hero, Frame 6 over the products band
 * and Frame 7 over the contact band — and each frame clips it.
 *
 * The exported SVG carries the room its blur needs, an extra 112.34 horizontal
 * and 112.40 vertical, so it sits at (-176.715, -206.408) within its frame.
 */
interface FractalInstance {
  readonly id: string;
  /** The frame that holds — and clips — this instance. */
  readonly frame: GlowRect;
  /** The exported tile's rect within that frame, blur padding included. */
  readonly tile: GlowRect;
  readonly vector: GlowVectorName;
  readonly opacity?: number;
  readonly depth: number;
}

const FRACTAL_TILES: readonly FractalInstance[] = [
  {
    id: "hero",
    frame: { x: -13, y: -10.596, width: 1545, height: 992.192 },
    /* Group 12 sits at (-64.375, -94.008) in the frame; the export adds 112.34
       horizontal and 112.40 vertical for its blur. */
    tile: { x: -176.715, y: -206.408, width: 1881.69, height: 1327.81 },
    vector: "field",
    /* Chrome's Gaussian spreads a little wider than Figma's, leaving the band
       hot at the edges. The rim is screen-composited and can only add, so the
       correction has to happen here. */
    opacity: 0.94,
    depth: 30,
  },
];

/** Group 13 (node 252:438), the footer band. Its highlight is #F0F7FD. */
const FOOTER_GLOW = {
  rect: { x: -276, y: 3414, width: 2072, height: 1321.91 } satisfies GlowRect,
  depth: 20,
};

function pct(value: number) {
  return `${(value / FRAME_WIDTH) * 100}%`;
}

/**
 * An instance of the background tile, clipped by its frame as Figma clips it.
 * The tile itself is far larger than the frame — 1821 x 1328 inside a 1565 x
 * 648 window — and letting it spill instead raises the band below the products
 * section by over 130/255.
 */
function FractalTile({ id, frame, tile, vector, opacity, depth }: FractalInstance) {
  return (
    <div
      className="absolute"
      style={{ left: pct(frame.x), top: frame.y, width: pct(frame.width), height: frame.height }}
    >
      <GlowField
        depth={depth}
        id={id}
        opacity={opacity}
        rect={tile}
        relativeTo={frame.width}
        vector={vector}
      />
    </div>
  );
}

export function PageAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-clip" aria-hidden="true">
      {FRACTAL_TILES.map((tile) => (
        <FractalTile key={tile.id} {...tile} />
      ))}

      <GlowField
        depth={FOOTER_GLOW.depth}
        id="footer"
        rect={FOOTER_GLOW.rect}
        vector="footer"
      />

      <PageBand />
      <PageRim />
    </div>
  );
}
