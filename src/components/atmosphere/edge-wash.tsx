import type { CSSProperties } from "react";
import { EDGE_WASH, type EdgeSurface } from "@/lib/design/edge-wash";
import { designPx } from "@/lib/design/units";

/**
 * One of the 402 frame's two edge columns of light.
 *
 * Two gradients rather than eight blurred vector groups: the colour ramp runs
 * down the page and the falloff runs across it, which is what the design's
 * groups add up to (see `lib/design/edge-wash`) and is separable to within a
 * couple of levels. A gradient is a thing the compositor can produce on its
 * own, so this costs no rasterisation, no filter, and no blur surface — where
 * the groups it replaces are eight Gaussians at 40-plus pixels of radius over
 * a page two and a half screens tall.
 *
 * It adds light rather than painting over it. The ramp is the difference
 * between the frame's edge and what the tiles and the footer band already put
 * there, so `plus-lighter` puts the two together the way the design's own
 * `screen` group does, and the sum is the frame.
 */
interface EdgeWashProps {
  readonly surface: EdgeSurface;
  readonly side: "left" | "right";
}

export function EdgeWash({ surface, side }: EdgeWashProps) {
  const spec = EDGE_WASH[surface];
  const reach = (spec.falloff.length - 1) * spec.step;

  const ramp = spec[side]
    .map(({ at, rgb }) => `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]}) ${at}%`)
    .join(",");

  const falloff = spec.falloff
    .map((share, index) => `rgb(0 0 0/${share}) ${((index * spec.step) / reach) * 100}%`)
    .join(",");

  /* Inside the column the strip starts at the frame's edge and fades inward;
     outside it, it starts at the column's edge and fades away from it, so the
     gradient runs the other way and the box is pinned past that edge. */
  const inward = side === "left" ? "right" : "left";
  const away = side === "left" ? "left" : "right";
  const mask = `linear-gradient(to ${spec.outside ? away : inward},${falloff})`;

  const place = spec.outside
    ? side === "left"
      ? "right-full"
      : "left-full"
    : side === "left"
      ? "left-0"
      : "right-0";

  return (
    <div
      className={`pointer-events-none absolute inset-y-0 ${place}`}
      style={
        {
          width: spec.outside ? "100vw" : designPx(reach),
          backgroundImage: `linear-gradient(to bottom,${ramp})`,
          maskImage: mask,
          WebkitMaskImage: mask,
          maskSize: spec.outside ? `${designPx(reach)} 100%` : undefined,
          WebkitMaskSize: spec.outside ? `${designPx(reach)} 100%` : undefined,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: spec.outside ? (side === "left" ? "right" : "left") : undefined,
          WebkitMaskPosition: spec.outside ? (side === "left" ? "right" : "left") : undefined,
          ...(spec.outside ? null : { mixBlendMode: "plus-lighter" as const }),
        } as CSSProperties
      }
    />
  );
}
