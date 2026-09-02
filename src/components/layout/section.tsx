import type { ReactNode } from "react";

/**
 * Figma frame is 1512 wide with content between x=104 and x=1408.
 *
 * `box-sizing: border-box` is global, so the max-width has to be the *frame*
 * width and the gutters live inside it — capping at 1304 would have produced a
 * 1096px content box and pulled every Figma x-coordinate ~98px inward.
 * The gutter collapses towards 40px on narrower desktops.
 */
export const CONTAINER = "mx-auto w-full max-w-[94.5rem] px-[clamp(2.5rem,6.88vw,6.5rem)]";

interface SectionProps {
  readonly id?: string;
  readonly children: ReactNode;
  /** Padding utilities for the section shell. */
  readonly className?: string;
  /** Extra utilities for the inner content column. */
  readonly innerClassName?: string;
  /**
   * Content positioned against the section rather than the 1304px column —
   * used by artwork that deliberately bleeds past the gutter, as it does in
   * the Figma frame.
   */
  readonly bleed?: ReactNode;
}

/**
 * Section shell: owns the light field, clips it, and places the content column
 * above it. `overflow-clip` is what keeps decorative layers from creating the
 * horizontal scrollbar the previous build had.
 */
export function Section({ id, children, className, innerClassName, bleed }: SectionProps) {
  return (
    <section id={id} className={`relative overflow-clip ${className ?? ""}`}>
      {bleed}
      <div className={`relative z-10 ${CONTAINER} ${innerClassName ?? ""}`}>{children}</div>
    </section>
  );
}
