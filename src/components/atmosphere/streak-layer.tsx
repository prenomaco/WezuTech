import type { CSSProperties } from "react";
import { GlowLayer } from "@/components/atmosphere/glow-layer";
import { designPx } from "@/lib/design/units";
import type { GlowVectorName } from "@/lib/design/glow-vectors";

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
export interface Streak {
  readonly vector: GlowVectorName;
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

export function StreakLayer({
  vector,
  box,
  inner,
  rotate,
  flipY,
  depth,
  render,
}: Streak) {
  return (
    <div
      className="pointer-events-none absolute flex items-center justify-center"
      data-glow-depth={depth}
      style={
        {
          left: box.left === undefined ? undefined : designPx(box.left),
          right: box.right === undefined ? undefined : designPx(box.right),
          top: designPx(box.top),
          width: designPx(box.width),
          height: designPx(box.height),
          /* Travel for the scroll-driven drift, as `globals.css` reads it. */
          "--glow-depth": designPx(depth),
        } as CSSProperties
      }
    >
      {/* Figma composes rotation before scale, so a mirrored streak reads as
          rotate-then-flip. Swapping the two flips the sign of the angle and
          throws the streak to the wrong side of the page. */}
      <div
        className="flex-none"
        style={{
          transform: `rotate(${rotate}deg)${flipY ? " scaleY(-1)" : ""}`,
        }}
      >
        <div
          className="relative"
          style={{
            width: designPx(inner.width),
            height: designPx(inner.height),
          }}
        >
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
