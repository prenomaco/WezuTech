import { GlowLayer } from "@/components/atmosphere/glow-layer";

/**
 * The site's edge light, reused rather than approximated.
 *
 * The first attempt at this painted radial gradients, which read as a bloom
 * behind the page instead of the design's light. This is the actual thing:
 * Group 21 from the Figma file, the same blurred vector the marketing pages run
 * down their left edge, at the same rotation and flip. Reusing it is also the
 * only way the two can stay in step when the design changes.
 *
 * It costs almost nothing here. `GlowLayer` rasterises at a quarter size, so
 * one streak is about 0.1 megapixels of 10px blur, and the element never moves.
 *
 * The placement box starts off-canvas at -381, exactly as the frame places it,
 * so what shows is the streak's inner edge falling away to the right, not the
 * whole shape.
 *
 * It is scaled up because the frame is 3984 tall and a dashboard is one screen:
 * at its own size the streak's lit band covers about six hundred pixels and
 * spends the rest of the height fading, which put all the light in the top
 * corner and left the edge below it dark. Scaled, the band spans the viewport
 * the way it spans the hero.
 */
const SCALE = 1.9;
const BOX = { left: -381, width: 738.767 } as const;
const INNER = { width: 2107.153, height: 548.383 } as const;

export function EdgeGlow({ className }: { readonly className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 left-0 overflow-hidden ${className ?? ""}`}
    >
      <div
        className="absolute top-1/2 flex -translate-y-1/2 items-center justify-center"
        style={{ left: BOX.left, width: BOX.width, height: 2148.471 }}
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
  );
}
