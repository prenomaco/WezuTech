/**
 * The page's edge rim, measured off the Figma render.
 *
 * The design runs a thin glowing border down both frame edges — continuous
 * from the hero to the footer, saturated blue through the middle of the page
 * and near-white at the bottom. It is a colour ramp rather than a single
 * glow, so it is stored as the sampled ramp itself: each stop is the layer
 * colour at that height, with the page ink subtracted because the rim is
 * screen-composited over it.
 *
 * Stored as the residual: what the rim must add on top of the vector glow to
 * reach the render, solved from the screen-blend equation
 * `rim = 1 - (1 - figma) / (1 - base)` per channel. Sampling the render
 * directly instead double-counts the hero and footer glows, which overshoot
 * their bands by ~68/255.
 */

/** [position down the page as a percentage, "r g b"] */
export type RimStop = readonly [number, string];

/** Horizontal falloff, measured at y=1800 and y=3120: gone by ~80px. */
export const RIM_REACH_PX = 90;

export const RIM_FALLOFF: readonly RimStop[] = [
  [0, "1"],
  [5, "0.9"],
  [12, "0.77"],
  [22, "0.55"],
  [39, "0.3"],
  [61, "0.08"],
  [100, "0"],
];

export const RIM_LEFT: readonly RimStop[] = [
  [0.0, "0 0 0"],
  [14.458, "0 0 0"],
  [16.867, "9 8 4"],
  [19.277, "116 137 154"],
  [21.687, "88 139 175"],
  [24.096, "46 106 146"],
  [28.916, "16 76 117"],
  [45.783, "7 38 59"],
  [55.422, "5 25 39"],
  [57.831, "2 28 45"],
  [62.651, "19 59 87"],
  [67.47, "33 48 60"],
  [79.518, "64 87 106"],
  [84.337, "45 78 102"],
  [89.157, "9 37 54"],
  [91.566, "0 10 20"],
  [93.976, "0 0 0"],
  [96.386, "0 0 0"],
  [98.795, "20 32 46"],
];

export const RIM_RIGHT: readonly RimStop[] = [
  [0.0, "0 0 0"],
  [2.41, "0 0 0"],
  [7.229, "13 17 12"],
  [9.639, "5 8 0"],
  [12.048, "8 13 9"],
  [14.458, "19 25 29"],
  [16.867, "6 4 0"],
  [55.422, "0 0 0"],
  [57.831, "2 13 22"],
  [60.241, "11 53 81"],
  [62.651, "12 61 91"],
  [65.06, "5 29 44"],
  [67.47, "4 7 11"],
  [77.108, "11 35 51"],
  [81.928, "7 34 52"],
  [93.976, "17 73 112"],
  [96.386, "25 88 133"],
  [98.795, "58 102 136"],
];
