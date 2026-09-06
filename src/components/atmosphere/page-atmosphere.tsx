import type { ReactNode } from "react";
import { GlowLayer } from "@/components/atmosphere/glow-layer";
import { RefractionFrame } from "@/components/atmosphere/refraction-frame";
import { StreakLayer } from "@/components/atmosphere/streak-layer";

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

/** The 402 frame's own height (node 305:48), which its light is placed down. */
const MOBILE_FRAME_WIDTH = 402;
const MOBILE_FRAME_HEIGHT = 5011;

/** Live transforms from frame 305:48; right-hand groups follow the viewport edge. */
function MobileEdgeStreaks() {
  return (
    <>
      <MobileLayer top={3626}>
        <StreakLayer
          box={{ right: -425.991, top: 0, width: 885.991, height: 1601.311 }}
          inner={{ width: 1528.549, height: 478.33 }}
          rotate={-73.79}
          depth={0}
          vector="streakLower"
        />
      </MobileLayer>
      <MobileLayer top={3541}>
        <StreakLayer
          box={{ left: -442, top: 0, width: 885.991, height: 1601.311 }}
          inner={{ width: 1528.549, height: 478.33 }}
          rotate={-106.21}
          flipY
          depth={0}
          vector="streakLower"
        />
      </MobileLayer>
      <MobileLayer top={2490}>
        <StreakLayer
          box={{ left: -403, top: 0, width: 841.396, height: 1599.356 }}
          inner={{ width: 1528.549, height: 478.33 }}
          rotate={-104.31}
          flipY
          depth={0}
          vector="streakLower"
        />
      </MobileLayer>
      <MobileLayer top={882}>
        <StreakLayer
          box={{ left: -438, top: 0, width: 790.832, height: 2157.081 }}
          inner={{ width: 2107.153, height: 530.548 }}
          rotate={-97.21}
          flipY
          depth={0}
          vector="mobileStreakUpper"
        />
      </MobileLayer>
      <MobileLayer top={544}>
        <StreakLayer
          box={{ right: -516.153, top: 0, width: 961.153, height: 2488.633 }}
          inner={{ width: 2426.828, height: 583.061 }}
          rotate={-80.86}
          depth={0}
          vector="mobileStreakRight"
        />
      </MobileLayer>
      <MobileLayer top={636.42}>
        <StreakLayer
          box={{ left: -457.94, top: 0, width: 885.349, height: 2174.471 }}
          inner={{ width: 2119.853, height: 694.415 }}
          rotate={-95.25}
          flipY
          depth={0}
          vector="mobileStreakLeft"
        />
      </MobileLayer>
      <MobileLayer top={2452}>
        <StreakLayer
          box={{ right: -402.396, top: 0, width: 841.396, height: 1599.356 }}
          inner={{ width: 1528.549, height: 478.33 }}
          rotate={-75.69}
          depth={0}
          vector="streakLower"
        />
      </MobileLayer>
    </>
  );
}

/**
 * One layer of the 402 frame's light, anchored as a fraction of the page.
 *
 * At 402px the page matches the 5011px reference. Other widths reflow the
 * content, so percentage anchors let the light follow the changing height.
 * Joined tiles must share one anchor to keep their common edge connected.
 */
function MobileLayer({
  top,
  children,
}: {
  readonly top: number;
  readonly children: ReactNode;
}) {
  return (
    <div
      className="absolute inset-x-0"
      style={{ top: `${(top / MOBILE_FRAME_HEIGHT) * 100}%` }}
    >
      {/* Full viewport width prevents a 402px crop from showing on tablets. */}
      <div className="relative mx-auto w-full">{children}</div>
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
      <MobileEdgeStreaks />
      {/* Frame 5 (305:64) — the hero tile. */}
      <div className="absolute inset-x-0 top-0 mx-auto h-[clamp(45.3125rem,180.3483vw,63.4375rem)] max-w-[35.175rem]">
        <div className="absolute inset-x-0 top-[17.2414%]">
          <RefractionFrame
            box={{ left: 0, top: 0, width: 402, height: 390.455 }}
            id="m-hero"
            relativeTo={MOBILE_FRAME_WIDTH}
            phaseOffset={-24}
            scaleWithWidth
            bleed
          >
            <GlowLayer
              box={{
                left: -152.33,
                top: -36.99,
                width: 652.032,
                height: 434.062,
              }}
              render={{ width: 740.45, height: 522.53 }}
              vector="field"
            />
          </RefractionFrame>
        </div>
      </div>

      {/* The joined mobile pair shares one surface and one page-height anchor. */}
      <MobileLayer top={2279}>
        <RefractionFrame
          box={{ left: 0, top: 0, width: 402, height: 233 }}
          id="m-products"
          relativeTo={MOBILE_FRAME_WIDTH}
          mirrorY
        >
          <GlowLayer
            box={{ left: 0, top: 93.61, width: 423.334, height: 292.49 }}
            relativeTo={402}
            render={{ width: 482.94, height: 352.12 }}
            vector="fieldDim"
          />
        </RefractionFrame>
      </MobileLayer>

      {/* Group 13 (375:121), using its own mobile vector and blur extent. */}
      <MobileLayer top={4845}>
        <GlowLayer
          box={{ left: -43, top: 0, width: 457, height: 403.578 }}
          relativeTo={MOBILE_FRAME_WIDTH}
          vector="mobileFooter"
        />
      </MobileLayer>
    </div>
  );
}

/**
 * Frame 5 (362:47) — the tile behind the hero.
 *
 * RefractionFrame extends the source through reflected canvas sampling at
 * wide viewports. There are no duplicated DOM tiles or additive mask layers.
 */
const HERO_TILE = {
  left: -13,
  top: -10.6,
  width: 1545,
  height: 992.192,
} as const;

function HeroTile() {
  return (
    <RefractionFrame box={HERO_TILE} bleed id="hero">
      <GlowLayer
        box={{ left: -64.38, top: -94.01, width: 1656.89, height: 1103.004 }}
        vector="field"
      />
    </RefractionFrame>
  );
}

/** Node 362:46 — the 1512 frame's background, layer for layer. */
function DesktopAtmosphere() {
  return (
    /*
     * Clipped at the viewport, and split into the two things the design's
     * light actually does.
     *
     * The tiles carry structure — the `field` vector has a dark waist about
     * five twelfths across, and that waist is drawn to land on the artwork
     * behind the hero. So they belong to the content column and are laid out
     * in the same `rem` the column is, which holds them at the design's exact
     * proportion at every width and locks them to the column past 1512 where
     * it stops growing. Stretching them to the viewport instead is what put
     * the waist at 160/255 on a 1905 screen where the design has 4.7.
     *
     * The streaks carry none — they are a soft falloff off one edge of the
     * frame, and the edge they decorate is the screen's. They hang off the
     * full-width parent so they keep reaching it, which is the whole reason
     * the design has them; parented to the column they left a dark band
     * either side of it on anything wider than 1512.
     */
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-clip lg:block"
    >
      {/* Group 17 (362:54) — the streak down the lower left. */}
      <StreakLayer
        box={{ left: -503, top: 2407.72, width: 677.451, height: 1578.601 }}
        depth={0}
        inner={{ width: 1528.549, height: 478.33 }}
        rotate={-97.65}
        vector="streakLower"
      />

      {/* Group 22 (362:58) — the streak down the right edge. */}
      <StreakLayer
        box={{
          right: -315.158,
          top: 2583.49,
          width: 698.618,
          height: 1476.808,
        }}
        depth={0}
        flipY
        inner={{ width: 1418.65, height: 478.33 }}
        rotate={80.82}
        vector="streakRight"
      />

      {/* Group 21 (362:103) — the streak down the upper left. */}
      <StreakLayer
        box={{ left: -381, top: 637, width: 738.767, height: 2148.471 }}
        depth={0}
        flipY
        inner={{ width: 2107.153, height: 548.383 }}
        rotate={-95.25}
        vector="streakUpper"
      />

      <div className="relative mx-auto h-full w-full max-w-[94.5rem]">
        {/* Frame 5 (362:47) — the hero tile. */}
        <HeroTile />

        {/* Group 13 (362:62) — the footer band. */}
        <GlowLayer
          box={{ left: -166, top: 3524, width: 1852, height: 1101.905 }}
          vector="footer"
        />

        {/* Frames 6/7 share a single mirrored surface. Full-width continuation
            prevents the old 1565px crop from appearing inside wide screens. */}
        <RefractionFrame
          box={{ left: -22, top: 1816, width: 1565, height: 648 }}
          id="products"
          mirrorY
          bleed
        >
          <GlowLayer
            box={{ left: 0, top: 353, width: 1596.426, height: 1103.004 }}
            vector="fieldDim"
          />
        </RefractionFrame>
      </div>
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
