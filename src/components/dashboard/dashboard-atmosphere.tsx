import { GlowLayer } from "@/components/atmosphere/glow-layer";
import { RefractionFrame } from "@/components/atmosphere/refraction-frame";

/**
 * The dashboard's background: the marketing pages' own, not an impression of
 * it.
 *
 * Earlier versions drew the edge streak alone and put the refraction across
 * the whole column, which read as a hard-edged strip pinned to the left edge —
 * nothing like the design, where the light is a broad soft bloom set in from
 * the edge with the ridges running softly through it. The bloom is not the
 * streak at all. It is `fieldDim`, a wide low glow, seen through the pattern
 * refraction, and the streak only lines the edge in front of it.
 *
 * So this is Frame 7's band, reused: node 252:429 draws a 1565 x 648 frame
 * holding `fieldDim`, and this is the same frame and the same field, drawn
 * once at a height that clears any plausible window. Stacking two of them the
 * way the page does put the join halfway down the screen, where the design
 * only ever has it between two full sections.
 *
 * The field is placed so its core lands mid-height rather than at the offset
 * the page uses, where the frame cuts the bloom off above its brightest part —
 * a dashboard is one screen, and the light has to resolve inside it.
 *
 * The band stretches to the column it is given — `relativeTo` places
 * everything proportionally — while the streaks stay pinned to the edges they
 * belong to, which is how the marketing pages handle a viewport wider than the
 * 1512 frame.
 */
const BAND = { width: 1565, height: 1400 } as const;

/**
 * Node 252:496 — the field itself, centred in the band.
 *
 * Its bright core sits halfway down its own 1103, so the offset is the band's
 * middle less that half.
 */
const FIELD = { width: 1596.426, height: 1103.004 } as const;
const FIELD_TOP = BAND.height / 2 - FIELD.height / 2;

/**
 * The edge streak, at the size and angle Frame 7 draws it.
 *
 * It carries no refraction of its own: the band behind it already does, and
 * running the displacement twice over the same edge doubled the ridges into
 * hard stripes. The placement box starts off-canvas, so what shows is the
 * streak's inner edge falling away rather than the whole shape.
 */
const STREAK = {
  box: { left: -381, width: 738.767, height: 2148.471 },
  inner: { width: 2107.153, height: 548.383 },
} as const;

/**
 * How far the streak is pushed down so its end clears the top of the screen.
 *
 * The shape's lit end sits close above its core, so centring the core drags
 * that end into view and the light stops at a hard line partway down. The end
 * goes above the viewport instead and the core rides high, which is how the
 * marketing pages read: light gathered in the upper third, falling away down
 * the rest of the column.
 */
const STREAK_OFFSET = 620;

/**
 * Brought to the intensity the marketing pages actually show.
 *
 * The field is drawn here without the rest of the page over it, so at the
 * opacity the frame gives it, it washed the whole column: measured on a strip
 * of each clear of text, the dashboard read a mean of 70 of 255 against the
 * landing page's 22, and a 99th percentile of 108 against 72.
 */
const LIT_OPACITY = 0.32;

function Streak({ side }: { readonly side: "left" | "right" }) {
  return (
    <div
      className={`absolute inset-y-0 overflow-hidden ${
        side === "left" ? "left-0 w-[19rem]" : "right-0 w-[15rem] scale-x-[-1]"
      }`}
    >
      <div
        className="absolute top-1/2 flex items-center justify-center"
        style={{
          left: STREAK.box.left,
          width: STREAK.box.width,
          height: STREAK.box.height,
          transform: `translateY(calc(-50% + ${STREAK_OFFSET}px))`,
        }}
      >
        {/* Figma composes rotation before scale, so a mirrored streak reads as
            rotate-then-flip; swapping them throws it to the other side. */}
        <div className="flex-none" style={{ transform: "rotate(-95.25deg) scaleY(-1)" }}>
          <div className="relative" style={{ width: STREAK.inner.width, height: STREAK.inner.height }}>
            <GlowLayer
              box={{ left: 0, top: 0, width: STREAK.inner.width, height: STREAK.inner.height }}
              vector="streakUpper"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardAtmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity: LIT_OPACITY }}
    >
      <RefractionFrame
        box={{ left: 0, top: 0, width: BAND.width, height: BAND.height }}
        id="dash-band"
        relativeTo={BAND.width}
      >
        <GlowLayer
          box={{ left: 0, top: FIELD_TOP, width: FIELD.width, height: FIELD.height }}
          relativeTo={BAND.width}
          vector="fieldDim"
        />
      </RefractionFrame>

      <Streak side="left" />
      <Streak side="right" />
    </div>
  );
}
