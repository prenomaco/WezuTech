import type { CSSProperties } from "react";
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
  readonly vector: "streakLower" | "streakUpper" | "streakRight";
  /**
   * The placement box the rotated child is centred in. A streak decorates one
   * edge, so it is pinned to that edge and keeps its size rather than being
   * stretched: `left` measures from the left edge, `right` from the right.
   */
  readonly box: {
    readonly left?: number;
    readonly right?: number;
    readonly top: number;
    readonly width: number;
    readonly height: number;
  };
  /** The child's own box, before rotation. */
  readonly inner: { readonly width: number; readonly height: number };
  readonly rotate: number;
  readonly flipY?: boolean;
  readonly depth: number;
  /** Size to draw the export at, when the frame instances it smaller. */
  readonly render?: { readonly width: number; readonly height: number };
}

function StreakLayer({ vector, box, inner, rotate, flipY, depth, render }: Streak) {
  return (
    <div
      className="pointer-events-none absolute flex items-center justify-center"
      data-glow-depth={depth}
      style={
        {
          left: box.left,
          right: box.right,
          top: box.top,
          width: box.width,
          height: box.height,
          /* Travel for the scroll-driven drift, as `globals.css` reads it. */
          "--glow-depth": `${depth}px`,
        } as CSSProperties
      }
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
            render={render}
            vector={vector}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * The 402 frame's own background (node 305:48).
 *
 * It is not the desktop field scaled: the frame instances the same groups at
 * different sizes and puts them somewhere else, and the desktop coordinates
 * dropped into a 402 viewport land the edge streaks across the middle of the
 * page, washing the copy out. Positions are the frame's own pixels, which is
 * the right unit here — the design width and a phone viewport are the same
 * order of magnitude, so there is nothing to scale between them.
 */
function MobileAtmosphere() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-clip lg:hidden"
    >
      {/* Frame 5 (305:64) — the hero tile. */}
      <RefractionFrame box={{ left: -127, top: 125, width: 608, height: 390.455 }} id="m-hero">
        <GlowLayer
          box={{ left: -25.33, top: -36.99, width: 652.032, height: 434.062 }}
          render={{ width: 740.45, height: 522.53 }}
          vector="field"
        />
      </RefractionFrame>

      {/* Frame 9 (307:157) — the tile again over the products band, dimmed. */}
      <RefractionFrame box={{ left: 0, top: 2279, width: 402, height: 233 }} id="m-products">
        <GlowLayer
          box={{ left: 0, top: 93.61, width: 423.334, height: 292.49 }}
          render={{ width: 482.94, height: 352.12 }}
          vector="fieldDim"
        />
      </RefractionFrame>

      {/* Frame 7 (305:142) — the same tile mirrored, picking up where 9 clips. */}
      <RefractionFrame
        box={{ left: 0, top: 2512, width: 402, height: 233 }}
        flipY
        id="m-contact"
      >
        <GlowLayer
          box={{ left: 0, top: 93.61, width: 423.334, height: 292.49 }}
          render={{ width: 482.94, height: 352.12 }}
          vector="fieldDim"
        />
      </RefractionFrame>

      {/* Group 21 (305:112) — the streak down the left edge. */}
      <StreakLayer
        box={{ left: -410, top: 647, width: 721.008, height: 2146.84 }}
        depth={22}
        flipY
        inner={{ width: 2107.153, height: 530.548 }}
        render={{ width: 2268.14, height: 691.62 }}
        rotate={-95.25}
        vector="streakUpper"
      />
    </div>
  );
}

/** Node 362:46 — the 1512 frame's background, layer for layer. */
function DesktopAtmosphere() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-clip lg:block"
    >
      {/* Frame 5 (362:47) — the hero tile. */}
      <RefractionFrame
        box={{ left: -13, top: -10.6, width: 1545, height: 992.192 }}
        id="hero"
        relativeTo={FRAME_WIDTH}
      >
        <GlowLayer
          box={{ left: -64.38, top: -94.01, width: 1656.89, height: 1103.004 }}
          relativeTo={1545}
          vector="field"
        />
      </RefractionFrame>

      {/* Group 17 (362:54) — the streak down the lower left. */}
      <StreakLayer
        box={{ left: -503, top: 2407.72, width: 677.451, height: 1578.601 }}
        depth={45}
        inner={{ width: 1528.549, height: 478.33 }}
        rotate={-97.65}
        vector="streakLower"
      />

      {/* Group 22 (362:58) — the streak down the right edge. */}
      <StreakLayer
        box={{ right: -315.158, top: 2583.49, width: 698.618, height: 1476.808 }}
        depth={45}
        flipY
        inner={{ width: 1418.65, height: 478.33 }}
        rotate={80.82}
        vector="streakRight"
      />

      {/* Group 13 (362:62) — the footer band. */}
      <GlowLayer
        box={{ left: -166, top: 3524, width: 1852, height: 1101.905 }}
        depth={20}
        relativeTo={FRAME_WIDTH}
        vector="footer"
      />

      {/* Frame 6 (362:85) — the tile again over the products band, dimmed. */}
      <RefractionFrame
        box={{ left: -22, top: 1816, width: 1565, height: 648 }}
        id="products"
        relativeTo={FRAME_WIDTH}
      >
        <GlowLayer
          box={{ left: 0, top: 353, width: 1596.426, height: 1103.004 }}
          relativeTo={1565}
          vector="fieldDim"
        />
      </RefractionFrame>

      {/*
        Frame 7 (267:598) — the same tile mirrored, picking up exactly where
        Frame 6 clips.

        Figma reports this frame three ways: the page's metadata says y=3112,
        the generated code says 2464, and the isolated-background copy of the
        page (node 362:46) renders it at 2304. The page itself settles it — its
        left edge runs smooth from 1800 to 2700 with no hard step anywhere,
        rising to 67/255 right where Frame 6 clips at 2464 and decaying from
        there. Only a top of 2464 joins without a seam; 2304 puts a visible
        banded step across the industries grid, which is what the isolated copy
        shows and the design does not.
      */}
      <RefractionFrame
        box={{ left: -21, top: 2464, width: 1565, height: 648 }}
        flipY
        id="contact"
        relativeTo={FRAME_WIDTH}
      >
        <GlowLayer
          box={{ left: 0, top: 353, width: 1596.426, height: 1103.004 }}
          relativeTo={1565}
          vector="fieldDim"
        />
      </RefractionFrame>

      {/* Group 21 (362:103) — the streak down the upper left. */}
      <StreakLayer
        box={{ left: -381, top: 637, width: 738.767, height: 2148.471 }}
        depth={45}
        flipY
        inner={{ width: 2107.153, height: 548.383 }}
        rotate={-95.25}
        vector="streakUpper"
      />
    </div>
  );
}

export function PageAtmosphere() {
  return (
    <>
      <MobileAtmosphere />
      <DesktopAtmosphere />
    </>
  );
}
