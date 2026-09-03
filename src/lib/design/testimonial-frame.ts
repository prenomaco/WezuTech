/**
 * The testimonial frame and attribution capsule, taken from Figma.
 *
 * Nodes 252:512 ("Vector 38") and 252:516 ("Vector 41"). Both are filled
 * `black` at 10% opacity — they darken the page rather than tinting it light,
 * which is what gives the quote its recessed panel look. Measured against the
 * render: the interior reads (2,6,25) against the (2,7,28) ink, exactly 0.9x.
 *
 * The export carries no stroke, but the render clearly has a 1px one. It is
 * only visible along the top and bottom edges and fades to nothing down the
 * sides, so it is drawn here as a vertical gradient. Alpha comes from the
 * render: the frame's top edge peaks at (58,63,82) over ink, the capsule's at
 * (112,117,134) — 0.24 and 0.48 of #dafaf5 respectively.
 */

export interface FramePath {
  readonly width: number;
  readonly height: number;
  readonly d: string;
  /** Stroke alpha at the top and bottom edges. */
  readonly strokeAlpha: number;
  /** The design draws this shape flipped from how it was exported. */
  readonly flipY: boolean;
}

export const QUOTE_FRAME: FramePath = {
  width: 725.265,
  height: 261.269,
  strokeAlpha: 0.24,
  flipY: true,
  d:
    "M364.306 0H625.906C630.576 0 635.192 1.00578 639.438 2.94894L674.836 19.1458" +
    "C679.083 21.089 683.698 22.0948 688.368 22.0948H692.742C710.704 22.0948 725.265 36.6559 725.265 54.6179" +
    "V228.746C725.265 246.708 710.704 261.269 692.742 261.269H364.306H360.959H32.5231" +
    "C14.5611 261.269 0 246.708 0 228.746V54.6178C0 36.6558 14.5611 22.0948 32.5231 22.0948H36.897" +
    "C41.5672 22.0948 46.1825 21.089 50.4292 19.1458L85.8269 2.94894C90.0736 1.00578 94.689 0 99.3591 0" +
    "H360.959H364.306Z",
};

export const QUOTE_CAPSULE: FramePath = {
  width: 382.689,
  height: 111.663,
  strokeAlpha: 0.48,
  flipY: false,
  d:
    "M192.227 0H328.168C332.026 0 335.853 0.686389 339.471 2.02708L356.171 8.21645" +
    "C358.359 9.02767 360.675 9.44299 363.009 9.44299C373.878 9.44299 382.689 18.2536 382.689 29.1221" +
    "V79.1396C382.689 97.1016 368.127 111.663 350.165 111.663H192.227H190.461H32.5231" +
    "C14.5611 111.663 0 97.1016 0 79.1396V29.1221C0 18.2536 8.81063 9.44299 19.6791 9.44299" +
    "C22.0134 9.44299 24.3291 9.02767 26.518 8.21645L43.218 2.02708C46.8355 0.686388 50.6626 0 54.5205 0" +
    "H190.461H192.227Z",
};

/** Figma places the frame at y=2636.80 and the capsule at y=2797.25. */
export const QUOTE_LAYOUT = {
  frameTop: 0,
  capsuleTop: 160.45,
} as const;
