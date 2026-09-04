import { GlowLayer } from "@/components/atmosphere/glow-layer";
import { DISPLACEMENT_SCALE, refractionMapUri } from "@/lib/design/refraction";
import { cn } from "@/lib/cn";

/**
 * The site's edge light, reused rather than approximated.
 *
 * An earlier attempt painted radial gradients, which read as a bloom behind the
 * page instead of the design's light. This is the actual thing: Group 21 from
 * the Figma file, the same blurred vector the marketing pages run down their
 * edges, at the same rotation and flip, under the same refraction shader that
 * puts the ridges through it. Reusing them is also the only way the two can
 * stay in step when the design changes.
 *
 * It costs little. `GlowLayer` rasterises at a quarter size, so one streak is
 * about 0.1 megapixels of 10px blur, and neither element ever moves.
 *
 * The placement box starts off-canvas at -381, exactly as the frame places it,
 * so what shows is the streak's inner edge falling away, not the whole shape.
 *
 * It is drawn at its own size. Scaling it up to fill a screen's height spread
 * the lit band across the full width of the content, so the page read as one
 * wash rather than as light gathered at an edge. At 1:1 the band covers about
 * six hundred pixels and falls away above and below it, which is what the
 * marketing pages show and what was asked for.
 */
const SCALE = 1;

/**
 * How far the streak is pushed down, so that its end clears the top of the
 * screen and the light has nowhere to stop.
 *
 * Centring the placement box does not centre the light — the box is the
 * shape's bounding box and the bright part sits high inside it — but centring
 * the *core* is not available either. The streak's lit end is only about 155px
 * above its core, so putting the core at the middle of an 807px screen drags
 * that end into view, and the light stops at a hard horizontal line partway
 * down. Stretching the shape along its length moves the end off the top, but
 * spreads the same light over more of it: at three times the length the column
 * was three times dimmer, and no opacity below 1 brings it back.
 *
 * So the end goes above the viewport and the core sits high, which is how the
 * marketing pages read anyway — light gathered in the upper third, falling away
 * down the rest of the column. Measured on the render, top to bottom: 36.5 at
 * the very top, rising smoothly to 77 at 0.17, then a long fade to 22.6, with
 * no step anywhere in it.
 */
const LIT_OFFSET = 620;

/**
 * Brought down to the marketing pages' own edge intensity.
 *
 * Centring the core puts the streak's brightest part on screen, where the
 * frame only ever shows its falling edge. Measured on a clean strip of each —
 * no text in the sample — the landing page's edge peaks at 70 of 255 and this
 * one peaked at 99, so it is scaled by the ratio between them.
 */
const LIT_OPACITY = 0.7;
const BOX = { left: -381, width: 738.767 } as const;
const INNER = { width: 2107.153, height: 548.383 } as const;

/**
 * How wide the ridge ramp is drawn, and how tall the filter region is.
 *
 * `feImage` is placed in the element's own pixels while the column's height is
 * the window's, so both are drawn past any plausible viewport. A tiled gradient
 * costs nothing at either size, and the ridges keep their 59.2px pitch instead
 * of stretching with the screen.
 */
const RAMP_COVER = 4000;

export function EdgeGlow({
  side = "left",
  className,
}: {
  readonly side?: "left" | "right";
  readonly className?: string;
}) {
  const filterId = `edge-glow-${side}`;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-0 overflow-hidden",
        side === "left" ? "left-0" : "right-0 scale-x-[-1]",
        className,
      )}
      style={{ opacity: LIT_OPACITY }}
    >
      <svg className="absolute size-0">
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
              height={RAMP_COVER}
              href={refractionMapUri(BOX.width, RAMP_COVER)}
              preserveAspectRatio="none"
              result="ridges"
              width={RAMP_COVER}
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

      <div className="absolute inset-0" style={{ filter: `url(#${filterId})` }}>
        <div
          className="absolute top-1/2 flex items-center justify-center"
          style={{
            left: BOX.left,
            width: BOX.width,
            height: 2148.471,
            transform: `translateY(calc(-50% + ${LIT_OFFSET}px))`,
          }}
        >
          {/* Figma composes rotation before scale, so a mirrored streak reads as
              rotate-then-flip; swapping them throws it to the other side. */}
          <div
            className="flex-none"
            style={{ transform: `rotate(-95.25deg) scaleY(-1) scale(${SCALE})` }}
          >
            <div className="relative" style={{ width: INNER.width, height: INNER.height }}>
              <GlowLayer
                box={{ left: 0, top: 0, width: INNER.width, height: INNER.height }}
                vector="streakUpper"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
