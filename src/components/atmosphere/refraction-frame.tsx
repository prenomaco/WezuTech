import type { ReactElement } from "react";
import type {
  GlowBox,
  GlowLayerProps,
} from "@/components/atmosphere/glow-layer";
import { RefractionCanvas } from "@/components/atmosphere/refraction-canvas";
import { designPx } from "@/lib/design/units";

interface RefractionFrameProps {
  readonly id: string;
  readonly box: GlowBox;
  readonly flipY?: boolean;
  /** Mirror the upper half into one continuous lower half on the same surface. */
  readonly mirrorY?: boolean;
  /** Continue the source across wide screens before applying refraction. */
  readonly bleed?: boolean;
  readonly relativeTo?: number;
  readonly scaleWithWidth?: boolean;
  readonly phaseOffset?: number;
  readonly children: ReactElement<GlowLayerProps>;
}

function frameStyle({
  box,
  mirrorY,
  relativeTo,
  scaleWithWidth,
}: Pick<
  RefractionFrameProps,
  "box" | "mirrorY" | "relativeTo" | "scaleWithWidth"
>) {
  const across = (value: number) =>
    relativeTo === undefined
      ? designPx(value)
      : `${(value / relativeTo) * 100}%`;

  const height = box.height * (mirrorY ? 2 : 1);
  return {
    left: across(box.left),
    top: designPx(box.top),
    width: across(box.width),
    height: scaleWithWidth ? undefined : designPx(height),
    aspectRatio: scaleWithWidth ? box.width / height : undefined,
  };
}

/** One static surface, not four filtered, masked, additive compositing groups. */
export function RefractionFrame(props: RefractionFrameProps) {
  const { id, box, flipY, mirrorY, bleed, phaseOffset, children } = props;
  /*
   * A bleeding frame paints wider than its own box on purpose — the canvas is
   * sized to the viewport so the field keeps reaching the screen edges past
   * the design width. Clipping across the frame threw that away and drew the
   * frame's own rectangle as a lit vertical edge in the gutter. `clip` is what
   * lets the other axis stay visible; `hidden` would force a scroll container
   * and clip it again. Nothing changes at or below 1512, where the frame is
   * already as wide as the screen.
   */
  const clip = bleed ? "overflow-x-visible overflow-y-clip" : "overflow-hidden";
  return (
    <div className={`pointer-events-none absolute ${clip}`} style={frameStyle(props)}>
      <RefractionCanvas
        id={id}
        frame={box}
        glow={children.props}
        flipY={flipY}
        mirrorY={mirrorY}
        bleed={bleed}
        phaseOffset={phaseOffset}
      >
        <div
          className={`absolute inset-x-0 top-0 overflow-hidden ${mirrorY ? "h-1/2" : "h-full"} ${flipY ? "-scale-y-100" : ""}`}
        >
          {children}
        </div>
        {mirrorY && (
          <div className="absolute inset-x-0 bottom-0 h-1/2 -scale-y-100 overflow-hidden">
            {children}
          </div>
        )}
      </RefractionCanvas>
    </div>
  );
}
