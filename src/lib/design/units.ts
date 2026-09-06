/**
 * The design's pixels, in the unit the page is scaled by.
 *
 * Every number taken off a Figma frame is a length in that frame's own
 * coordinates. `globals.css` maps a frame onto a screen with one dial — the
 * root font size — so a design pixel is a `rem`, and stating it that way is
 * what makes the light scale in step with the content it lights rather than
 * needing a percentage, a breakpoint, or a second set of numbers.
 *
 * The divisor is the root size the frames were measured at, not a preference:
 * at 1512 the scale resolves to exactly 16px and a design pixel comes back as
 * itself.
 */
const DESIGN_ROOT = 16;

export function designPx(value: number): string {
  return `${(value / DESIGN_ROOT).toFixed(5)}rem`;
}
