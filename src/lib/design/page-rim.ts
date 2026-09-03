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
  [16.867, "15 8 0"],
  [19.277, "119 140 155"],
  [21.687, "91 143 177"],
  [24.096, "50 109 149"],
  [28.916, "21 80 120"],
  [45.783, "12 43 64"],
  [53.012, "13 38 54"],
  [55.422, "9 28 41"],
  [57.831, "1 12 15"],
  [60.241, "0 0 0"],
  [62.651, "23 64 91"],
  [67.47, "37 53 65"],
  [79.518, "68 92 110"],
  [84.337, "49 82 106"],
  [86.747, "32 65 88"],
  [91.566, "0 0 0"],
  [93.976, "0 0 0"],
  [96.386, "0 0 20"],
  [98.795, "82 118 167"],
];

export const RIM_RIGHT: readonly RimStop[] = [
  [0.0, "0 0 0"],
  [4.819, "0 0 0"],
  [7.229, "10 15 12"],
  [9.639, "3 8 0"],
  [12.048, "3 7 0"],
  [14.458, "20 27 32"],
  [16.867, "9 12 8"],
  [60.241, "0 0 0"],
  [62.651, "12 61 91"],
  [65.06, "5 29 44"],
  [67.47, "4 7 11"],
  [77.108, "11 35 51"],
  [81.928, "7 34 52"],
  [89.157, "11 50 77"],
  [91.566, "3 25 36"],
  [93.976, "0 5 14"],
  [96.386, "29 95 142"],
  [98.795, "80 133 181"],
];
