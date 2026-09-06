import { GlowLayer } from "@/components/atmosphere/glow-layer";
import { RefractionFrame } from "@/components/atmosphere/refraction-frame";
import { StreakLayer } from "@/components/atmosphere/streak-layer";

/**
 * The About page's light (Figma node 307:165).
 *
 * Same layers as the home page, placed against its own 1512 x 3151 frame. The
 * hero tile is a larger instance than the home page's — Frame 8 is 1675 x 1335
 * holding a 2123-wide group, against 1545 x 992 holding 1657 — which is what
 * makes the top of this page read as one wide wash rather than an hourglass.
 *
 * Split the same way as the home page: the tiles carry structure and belong to
 * the content column, the streaks decorate the screen's edges and hang off the
 * full-width parent so they keep reaching them past 1512.
 */
export function AboutAtmosphere() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-clip"
    >
      <StreakLayer
        box={{ left: -270, top: 21, width: 533.374, height: 1657.703 }}
        depth={0}
        flipY
        inner={{ width: 1634.045, height: 433.163 }}
        rotate={-86.45}
        vector="streakAboutLeft"
      />
      <StreakLayer
        box={{ right: -228.413, top: 84.16, width: 534.673, height: 1851.871 }}
        depth={0}
        inner={{ width: 1826.994, height: 397.1 }}
        rotate={-85.65}
        vector="streakAboutRight"
      />
      {/* Group 22 (307:177) — the streak down the right edge. */}
      <StreakLayer
        box={{ right: -315.158, top: 1737, width: 698.618, height: 1476.808 }}
        depth={0}
        flipY
        inner={{ width: 1418.65, height: 478.33 }}
        rotate={80.82}
        vector="streakRight"
      />

      {/* Group 17 (307:173), with the live rotated bounds from Figma. */}
      <StreakLayer
        box={{ left: -521.93, top: 2052.7, width: 696.381, height: 1719.612 }}
        depth={0}
        inner={{ width: 1670.825, height: 478.33 }}
        render={{ width: 1828.825, height: 636.33 }}
        rotate={-97.65}
        vector="streakLower"
      />

      <div className="relative mx-auto h-full w-full max-w-[94.5rem]">
        {/* Frame 8 (374:268) — the wide tile behind the introduction. */}
        <RefractionFrame
          box={{ left: -142, top: -439, width: 1675, height: 1335 }}
          bleed
          id="about-hero"
        >
          {/* Use the About export itself, including its Gaussian margins. */}
          <GlowLayer
            box={{ left: -434, top: -156, width: 2123, height: 1304.443 }}
            vector="fieldAbout"
          />
        </RefractionFrame>

        {/* The capabilities/contact pair shares one reflected surface. */}
        <RefractionFrame
          box={{ left: -22, top: 991, width: 1565, height: 648 }}
          id="about-capabilities"
          mirrorY
          bleed
        >
          <GlowLayer
            box={{ left: 0, top: 353, width: 1596.426, height: 1103.004 }}
            vector="fieldDim"
          />
        </RefractionFrame>

        {/* Group 13 (307:181) — the footer band. */}
        <GlowLayer
          box={{ left: -166, top: 2726.18, width: 1852, height: 1053.236 }}
          vector="footerAbout"
        />
      </div>
    </div>
  );
}
