import type { CSSProperties } from "react";
import { GlowLayer } from "@/components/atmosphere/glow-layer";
import { RefractionFrame } from "@/components/atmosphere/refraction-frame";

/**
 * The About page's light (Figma node 307:165).
 *
 * Same layers as the home page, placed against its own 1512 x 3151 frame. The
 * hero tile is a larger instance than the home page's — Frame 8 is 1675 x 1179
 * holding a 2123-wide group, against 1545 x 992 holding 1657 — which is what
 * makes the top of this page read as one wide wash rather than an hourglass.
 *
 * As on the home page, the layers that span the frame are placed
 * proportionally so the light reaches the edges of the screen rather than the
 * edges of the design, and the edge streak is pinned to the edge it decorates.
 */

const FRAME_WIDTH = 1512;

export function AboutAtmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-clip">
      {/* Frame 8 (374:268) — the wide tile behind the introduction. */}
      <RefractionFrame
        box={{ left: -142, top: -439, width: 1675, height: 1179 }}
        id="about-hero"
        relativeTo={FRAME_WIDTH}
      >
        <GlowLayer
          box={{ left: -434, top: -156, width: 2123, height: 1304.443 }}
          relativeTo={1675}
          vector="field"
        />
      </RefractionFrame>

      {/* Frame 8 (375:142) — the dimmed tile over the capabilities panel. */}
      <RefractionFrame
        box={{ left: -22, top: 991, width: 1565, height: 648 }}
        id="about-capabilities"
        relativeTo={FRAME_WIDTH}
      >
        <GlowLayer
          box={{ left: 0, top: 353, width: 1596.426, height: 1103.004 }}
          relativeTo={1565}
          vector="fieldDim"
        />
      </RefractionFrame>

      {/* Group 22 (307:177) — the streak down the right edge. */}
      <div
        className="pointer-events-none absolute flex items-center justify-center"
        data-glow-depth={45}
        style={
          {
            right: -315.158,
            top: 1813.342,
            width: 698.618,
            height: 1476.808,
            "--glow-depth": "45px",
          } as CSSProperties
        }
      >
        <div className="flex-none" style={{ transform: "rotate(80.82deg) scaleY(-1)" }}>
          <div className="relative" style={{ width: 1418.65, height: 478.33 }}>
            <GlowLayer
              box={{ left: 0, top: 0, width: 1418.65, height: 478.33 }}
              vector="streakRight"
            />
          </div>
        </div>
      </div>

      {/*
        Frame 7 (307:211) — the tile again, mirrored, picking up exactly where
        the frame above it clips.

        The metadata reports y=2287, which is its far edge rather than its
        origin, the same way the home frame reported 3112 for a frame that
        starts at 2464. The render settles it: this page has no hard step at
        1639 or at 2287, and its left edge is lit from 1500 to 1800 and ink by
        1900 — which only happens if this frame begins where the one above ends.
      */}
      <RefractionFrame
        box={{ left: -21, top: 1639, width: 1565, height: 648 }}
        flipY
        id="about-contact"
        relativeTo={FRAME_WIDTH}
      >
        <GlowLayer
          box={{ left: 0, top: 353, width: 1596.426, height: 1103.004 }}
          relativeTo={1565}
          vector="fieldDim"
        />
      </RefractionFrame>

      {/*
        Group 17 (307:173) — the streak down the lower left.

        Its metadata y is the far edge again: 3772.32 less its own 1578.6 puts
        it at 2193.72, which is the same arithmetic that turns the home frame's
        reported 3986.32 into the 2407.72 its generated code gives. Without it
        the left edge is ink from 2200 down, where the render is lit to 32/255.
      */}
      <div
        className="pointer-events-none absolute flex items-center justify-center"
        data-glow-depth={45}
        style={
          {
            left: -503,
            top: 2193.72,
            width: 677.451,
            height: 1578.601,
            "--glow-depth": "45px",
          } as CSSProperties
        }
      >
        <div className="flex-none" style={{ transform: "rotate(-97.65deg)" }}>
          <div className="relative" style={{ width: 1528.549, height: 478.33 }}>
            <GlowLayer
              box={{ left: 0, top: 0, width: 1528.549, height: 478.33 }}
              vector="streakLower"
            />
          </div>
        </div>
      </div>

      {/* Group 13 (307:181) — the footer band. */}
      <GlowLayer
        box={{ left: -166, top: 2677.51, width: 1852, height: 1101.905 }}
        depth={20}
        relativeTo={FRAME_WIDTH}
        vector="footer"
      />
    </div>
  );
}
