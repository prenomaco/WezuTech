import { GlowLayer } from "@/components/atmosphere/glow-layer";
import { RefractionFrame } from "@/components/atmosphere/refraction-frame";

/**
 * The page's light, as one continuous field.
 *
 * This is node 362:46 — the design's background with the content stripped out —
 * layer for layer and in its paint order. Figma places all of it against the
 * 1512 x 3984 frame, spanning section boundaries, so it is mounted once for the
 * whole page rather than per section; scoping it per section makes each one
 * clip its own light and the joins show as hard horizontal seams.
 *
 * Three of the layers are frames carrying a refraction shader, three are edge
 * streaks placed by transform, and one is the footer band.
 */

const FRAME_WIDTH = 1512;

/**
 * An edge streak — Groups 17, 21 and 22.
 *
 * These are wide, flat, landscape groups that the design rotates towards
 * vertical and stretches hard: Group 17's export is 1686 x 636 and it ends up
 * roughly 480 tall inside a 1529-wide box before rotation. Figma centres the
 * rotated child in the placement box, which is what the flex centring here is
 * doing, and `preserveAspectRatio="none"` on the glow lets the blur stretch
 * anisotropically the way the design's does.
 */
interface Streak {
  readonly id: string;
  readonly vector: "streakLower" | "streakUpper" | "streakRight";
  /** The placement box the rotated child is centred in. */
  readonly box: { readonly left: number; readonly top: number; readonly width: number; readonly height: number };
  /** The child's own box, before rotation. */
  readonly inner: { readonly width: number; readonly height: number };
  readonly rotate: number;
  readonly flipY?: boolean;
  readonly depth: number;
}

function StreakLayer({ id, vector, box, inner, rotate, flipY, depth }: Streak) {
  return (
    <div
      className="pointer-events-none absolute flex items-center justify-center will-change-transform"
      data-glow-depth={depth}
      style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
    >
      {/* Figma composes rotation before scale, so a mirrored streak reads as
          rotate-then-flip. Swapping the two flips the sign of the angle and
          throws the streak to the wrong side of the page. */}
      <div
        className="flex-none"
        style={{ transform: `rotate(${rotate}deg)${flipY ? " scaleY(-1)" : ""}` }}
      >
        <div className="relative" style={{ width: inner.width, height: inner.height }}>
          <GlowLayer
            box={{ left: 0, top: 0, width: inner.width, height: inner.height }}
            id={id}
            vector={vector}
          />
        </div>
      </div>
    </div>
  );
}

export function PageAtmosphere() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-clip"
      style={{ width: FRAME_WIDTH }}
    >
      {/* Frame 5 (362:47) — the hero tile. */}
      <RefractionFrame box={{ left: -13, top: -10.6, width: 1545, height: 992.192 }} depth={30} id="hero">
        <GlowLayer
          box={{ left: -64.38, top: -94.01, width: 1656.89, height: 1103.004 }}
          id="hero"
          vector="field"
        />
      </RefractionFrame>

      {/* Group 17 (362:54) — the streak down the lower left. */}
      <StreakLayer
        box={{ left: -503, top: 2407.72, width: 677.451, height: 1578.601 }}
        depth={45}
        id="streak-lower"
        inner={{ width: 1528.549, height: 478.33 }}
        rotate={-97.65}
        vector="streakLower"
      />

      {/* Group 22 (362:58) — the streak down the right edge. */}
      <StreakLayer
        box={{ left: 1128.54, top: 2583.49, width: 698.618, height: 1476.808 }}
        depth={45}
        flipY
        id="streak-right"
        inner={{ width: 1418.65, height: 478.33 }}
        rotate={80.82}
        vector="streakRight"
      />

      {/* Group 13 (362:62) — the footer band. */}
      <GlowLayer
        box={{ left: -166, top: 3524, width: 1852, height: 1101.905 }}
        depth={20}
        id="footer"
        screen
        vector="footer"
      />

      {/* Frame 6 (362:85) — the tile again over the products band, dimmed. */}
      <RefractionFrame box={{ left: -22, top: 1816, width: 1565, height: 648 }} depth={70} id="products">
        <GlowLayer
          box={{ left: 0, top: 353, width: 1596.426, height: 1103.004 }}
          id="products"
          vector="fieldDim"
        />
      </RefractionFrame>

      {/*
        Frame 7 (362:92) — the same tile mirrored, overlapping the one above.

        Figma reports this frame's position three different ways: the metadata
        gives y=3112, the generated code gives top=2464, and the rendered
        background puts it at 2304. The render wins, and it is checkable — the
        export has exactly two hard horizontal edges, +85/255 at y=2304 where
        this frame switches on and -11/255 at y=2464 where Frame 6 clips off.
        Only a top of 2304 produces both.
      */}
      <RefractionFrame box={{ left: -21, top: 2304, width: 1565, height: 648 }} depth={70} flipY id="contact">
        <GlowLayer
          box={{ left: 0, top: 353, width: 1596.426, height: 1103.004 }}
          id="contact"
          vector="fieldDim"
        />
      </RefractionFrame>

      {/* Group 21 (362:103) — the streak down the upper left. */}
      <StreakLayer
        box={{ left: -381, top: 637, width: 738.767, height: 2148.471 }}
        depth={45}
        flipY
        id="streak-upper"
        inner={{ width: 2107.153, height: 548.383 }}
        rotate={-95.25}
        vector="streakUpper"
      />
    </div>
  );
}
