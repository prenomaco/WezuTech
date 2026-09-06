/**
 * The testimonial frame and attribution capsule, taken from Figma.
 *
 * Nodes 252:512 ("Vector 38") and 252:516 ("Vector 41"). Both are filled
 * `black` at 10% opacity — they darken the page rather than tinting it light,
 * which is what gives the quote its recessed panel look. Measured against the
 * render: the interior reads (2,6,25) against the (2,7,28) ink, exactly 0.9x.
 *
 * The export carries no stroke; the render draws its own. Down the sides the
 * page reads 7.5/255, the ink untouched, so the sides carry none — but all
 * four long edges do, and the two that carry the most are the frame's notched
 * bottom and the capsule's notched top, which is what makes the pair read as
 * one plate with a tab hanging out of it. Sampled across each edge in Figma's
 * export, five rows deep and clear of the corners:
 *
 *   frame top      peak  66  mean 22.7
 *   frame bottom   peak 240  mean 28.9
 *   capsule top    peak 119  mean 31.1
 *   capsule bottom peak  64  mean 17.6
 *
 * The alphas below are those means over the page ink, scaled against a
 * measured render of this component. An earlier version lit only the frame's
 * top and the capsule's bottom — the two faintest of the four — which left the
 * shape with no bottom edge at all.
 */

import type { FramePath } from "@/lib/design/notched-frame";

export type { FramePath };

export const QUOTE_FRAME: FramePath = {
  width: 725.265,
  height: 261.269,
  lit: [
    { edge: "top", alpha: 0.28 },
    { edge: "bottom", alpha: 0.39 },
  ],
  strokeWidth: 2,
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
  lit: [
    { edge: "top", alpha: 0.73 },
    { edge: "bottom", alpha: 0.32 },
  ],
  strokeWidth: 2,
  flipY: false,
  opaqueFill: "#020619",
  d:
    "M192.227 0H328.168C332.026 0 335.853 0.686389 339.471 2.02708L356.171 8.21645" +
    "C358.359 9.02767 360.675 9.44299 363.009 9.44299C373.878 9.44299 382.689 18.2536 382.689 29.1221" +
    "V79.1396C382.689 97.1016 368.127 111.663 350.165 111.663H192.227H190.461H32.5231" +
    "C14.5611 111.663 0 97.1016 0 79.1396V29.1221C0 18.2536 8.81063 9.44299 19.6791 9.44299" +
    "C22.0134 9.44299 24.3291 9.02767 26.518 8.21645L43.218 2.02708C46.8355 0.686388 50.6626 0 54.5205 0" +
    "H190.461H192.227Z",
};

export const QUOTE_FRAME_MOBILE: FramePath = {
  ...QUOTE_FRAME,
  width: 316.185,
  height: 243.902,
  strokeWidth: 1,
  d: "M158.822 0H272.868C274.904 0 276.916 0.438478 278.768 1.28561L294.2 8.34676C296.051 9.19389 298.063 9.63237 300.099 9.63237H302.006C309.836 9.63237 316.185 15.9804 316.185 23.811V229.723C316.185 237.554 309.836 243.902 302.006 243.902H158.822H157.363H14.1787C6.34801 243.902 0 237.554 0 229.723V23.8111C0 15.9804 6.34801 9.63237 14.1787 9.63237H16.0855C18.1215 9.63237 20.1336 9.19389 21.985 8.34676L37.4169 1.28561C39.2682 0.438477 41.2803 0 43.3163 0H157.363H158.822Z",
};

export const QUOTE_CAPSULE_MOBILE: FramePath = {
  ...QUOTE_CAPSULE,
  width: 230,
  height: 64,
  strokeWidth: 1,
  d: "M115.531 0H198.306C199.916 0 201.514 0.274058 203.031 0.810424L214.126 4.73175C215.4 5.18216 216.742 5.4123 218.094 5.4123C224.669 5.4123 230 10.743 230 17.3187V49.8213C230 57.652 223.652 64 215.821 64H115.531H114.469H14.1787C6.34802 64 0 57.652 0 49.8213V17.3187C0 10.743 5.33067 5.4123 11.9064 5.4123C13.258 5.4123 14.5997 5.18216 15.8741 4.73175L26.9688 0.810423C28.4863 0.274057 30.0841 0 31.6937 0H114.469H115.531Z",
};

/** Figma places the frame at y=2636.80 and the capsule at y=2797.25. */
export const QUOTE_LAYOUT = {
  frameTop: 0,
  capsuleTop: 160.45,
} as const;
