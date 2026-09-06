/**
 * The light down the two long edges of the 402 frame.
 *
 * The frame runs eight blurred groups past its sides — Groups 34, 35, 36, 37,
 * two called 17 and two called 21 — rotated towards vertical and stretched to
 * two and a half times the frame's height. Figma reports each one's box before
 * its rotation, so the numbers in the file place a 961-wide group at x=-43 and
 * an 885-wide one at x=444, which is off both sides of a 402 frame; rebuilding
 * them from those boxes put a bright wash across the footer navigation once
 * already.
 *
 * What all eight of them add up to, though, is one thing: a soft column of
 * light down each edge whose brightness rises and falls as the page goes by.
 * That is measured here rather than reconstructed. {@link EDGE_RAMP} is the
 * frame's own render sampled three pixels in from each side, with the two
 * places content reaches the edge — the full-bleed hero photograph and the
 * footer panel — interpolated across and the rest smoothed over an 81px
 * window, less what the tiles and the footer band already put there. So each
 * stop is the light this layer still owes, and nothing is counted twice.
 *
 * Stops are fractions of the page, not pixels. The 402 frame is 5011 tall and
 * this page is about 5275 — the copy re-wraps, and the difference accumulates
 * downward — so a pixel offset taken from the frame lands most of a section
 * high by the footer. A fraction tracks the page it is actually lighting, at
 * any height, in any translation.
 *
 * @see MOBILE_FRAME_HEIGHT in `components/atmosphere/page-atmosphere`
 */

export interface EdgeStop {
  /** Fraction of the page, as a percentage. */
  readonly at: number;
  readonly rgb: readonly [number, number, number];
}

const LEFT: readonly EdgeStop[] = [
  { at: 0, rgb: [2, 3, 2] },
  { at: 4, rgb: [0, 0, 0] },
  { at: 8, rgb: [2, 5, 7] },
  { at: 12, rgb: [0, 0, 0] },
  { at: 16, rgb: [3, 7, 9] },
  { at: 20, rgb: [19, 60, 79] },
  { at: 24, rgb: [14, 61, 84] },
  { at: 28, rgb: [9, 41, 57] },
  { at: 32, rgb: [5, 26, 37] },
  { at: 36, rgb: [4, 19, 27] },
  { at: 40, rgb: [5, 20, 28] },
  { at: 44, rgb: [8, 37, 52] },
  { at: 48, rgb: [2, 16, 23] },
  { at: 52, rgb: [17, 63, 87] },
  { at: 56, rgb: [0, 0, 0] },
  { at: 60, rgb: [5, 23, 33] },
  { at: 64, rgb: [4, 20, 29] },
  { at: 68, rgb: [5, 27, 38] },
  { at: 72, rgb: [20, 58, 78] },
  { at: 76, rgb: [7, 27, 37] },
  { at: 80, rgb: [2, 8, 11] },
  { at: 84, rgb: [2, 7, 10] },
  { at: 88, rgb: [3, 14, 20] },
  { at: 92, rgb: [11, 36, 48] },
  { at: 96, rgb: [8, 26, 35] },
  { at: 100, rgb: [45, 79, 97] },
];

const RIGHT: readonly EdgeStop[] = [
  { at: 0, rgb: [3, 3, 3] },
  { at: 4, rgb: [0, 0, 0] },
  { at: 8, rgb: [4, 12, 16] },
  { at: 12, rgb: [4, 14, 19] },
  { at: 16, rgb: [13, 57, 79] },
  { at: 20, rgb: [8, 38, 54] },
  { at: 24, rgb: [5, 26, 37] },
  { at: 28, rgb: [4, 21, 30] },
  { at: 32, rgb: [4, 20, 29] },
  { at: 36, rgb: [4, 23, 33] },
  { at: 40, rgb: [7, 31, 43] },
  { at: 44, rgb: [17, 47, 61] },
  { at: 48, rgb: [6, 17, 23] },
  { at: 52, rgb: [15, 67, 93] },
  { at: 56, rgb: [0, 0, 0] },
  { at: 60, rgb: [4, 22, 31] },
  { at: 64, rgb: [4, 21, 30] },
  { at: 68, rgb: [7, 31, 43] },
  { at: 72, rgb: [16, 45, 58] },
  { at: 76, rgb: [10, 43, 60] },
  { at: 80, rgb: [4, 18, 26] },
  { at: 84, rgb: [3, 15, 21] },
  { at: 88, rgb: [4, 20, 29] },
  { at: 92, rgb: [12, 40, 54] },
  { at: 96, rgb: [17, 43, 56] },
  { at: 100, rgb: [41, 43, 43] },
];

/**
 * How the light falls away from the edge, as a share of its value there.
 *
 * Averaged over every row of the frame where the edge is lit and no content
 * reaches it — 1667 rows on the left, 2389 on the right. The two sides agree
 * to within 0.02 the whole way across, which is why one curve serves both:
 * these are the same groups, mirrored.
 *
 * Sampled every 10 frame pixels, so the last entry is the reach.
 */
const MOBILE_FALLOFF: readonly number[] = [
  1, 0.816, 0.578, 0.458, 0.334, 0.232, 0.17, 0.12, 0.081, 0.067, 0.042, 0.022, 0.013, 0.006, 0,
];

const ABOUT_FALLOFF: readonly number[] = [
  1, 0.814, 0.595, 0.492, 0.45, 0.245, 0.158, 0.077, 0.067, 0.055, 0,
];

const ABOUT_LEFT: readonly EdgeStop[] = [
  { at: 0, rgb: [9, 9, 9] },
  { at: 4, rgb: [3, 7, 9] },
  { at: 8, rgb: [0, 0, 0] },
  { at: 84, rgb: [0, 0, 0] },
  { at: 88, rgb: [26, 33, 41] },
  { at: 92, rgb: [49, 59, 63] },
  { at: 96, rgb: [15, 23, 23] },
  { at: 100, rgb: [0, 3, 7] },
];

const ABOUT_RIGHT: readonly EdgeStop[] = [
  { at: 0, rgb: [23, 29, 30] },
  { at: 4, rgb: [24, 30, 32] },
  { at: 8, rgb: [24, 32, 34] },
  { at: 12, rgb: [0, 5, 6] },
  { at: 16, rgb: [0, 5, 9] },
  { at: 20, rgb: [0, 0, 0] },
  { at: 60, rgb: [0, 2, 3] },
  { at: 64, rgb: [1, 6, 9] },
  { at: 68, rgb: [2, 7, 9] },
  { at: 76, rgb: [0, 0, 0] },
  { at: 84, rgb: [0, 6, 9] },
  { at: 88, rgb: [4, 22, 33] },
  { at: 92, rgb: [19, 58, 77] },
  { at: 96, rgb: [18, 39, 38] },
  { at: 100, rgb: [0, 6, 12] },
];


/**
 * How the 1512 frame's own edges are lit, and how that light falls inward.
 *
 * Used the other way round: past 1512 the content column stops growing and
 * the design has nothing to say about the screen either side of it, so the
 * frame's edge is continued outward with the falloff it already has going
 * inward. A reflection is the honest guess — it matches the value and the
 * slope at the join — and this is that reflection stated as a gradient rather
 * than as a second copy of the tile, which is both cheaper and something every
 * engine composites the same way.
 *
 * Sampled three pixels in from each edge of the frame's render and smoothed
 * over 61 rows; the falloff is averaged over 4124 rows of both edges.
 */
const FRAME_FALLOFF: readonly number[] = [
  1, 0.77, 0.551, 0.417, 0.308, 0.254, 0.222, 0.175, 0.163, 0.142, 0.115, 0.108, 0.088, 0.072,
  0.071, 0.059, 0,
];

const FRAME_LEFT: readonly EdgeStop[] = [
  { at: 0, rgb: [2, 11, 35] },
  { at: 3.03, rgb: [15, 46, 79] },
  { at: 6.06, rgb: [73, 104, 135] },
  { at: 9.09, rgb: [81, 108, 136] },
  { at: 12.12, rgb: [66, 88, 115] },
  { at: 15.15, rgb: [73, 102, 131] },
  { at: 18.18, rgb: [90, 121, 150] },
  { at: 21.21, rgb: [106, 158, 196] },
  { at: 24.24, rgb: [52, 114, 162] },
  { at: 27.27, rgb: [29, 93, 143] },
  { at: 30.3, rgb: [19, 80, 130] },
  { at: 33.33, rgb: [16, 72, 119] },
  { at: 36.36, rgb: [15, 65, 109] },
  { at: 39.39, rgb: [14, 58, 100] },
  { at: 42.42, rgb: [14, 53, 92] },
  { at: 45.45, rgb: [14, 49, 86] },
  { at: 48.48, rgb: [15, 48, 83] },
  { at: 51.52, rgb: [16, 46, 80] },
  { at: 54.55, rgb: [13, 40, 72] },
  { at: 57.58, rgb: [10, 38, 71] },
  { at: 60.61, rgb: [15, 57, 97] },
  { at: 63.64, rgb: [29, 70, 108] },
  { at: 66.67, rgb: [37, 60, 88] },
  { at: 69.7, rgb: [48, 69, 94] },
  { at: 72.73, rgb: [56, 78, 105] },
  { at: 75.76, rgb: [62, 87, 115] },
  { at: 78.79, rgb: [68, 95, 124] },
  { at: 81.82, rgb: [63, 94, 126] },
  { at: 84.85, rgb: [47, 84, 119] },
  { at: 87.88, rgb: [25, 60, 96] },
  { at: 90.91, rgb: [11, 38, 76] },
  { at: 93.94, rgb: [16, 58, 107] },
  { at: 96.97, rgb: [125, 167, 203] },
  { at: 100, rgb: [172, 201, 225] },
];

const FRAME_RIGHT: readonly EdgeStop[] = [
  { at: 0, rgb: [3, 15, 39] },
  { at: 3.03, rgb: [22, 64, 104] },
  { at: 6.06, rgb: [96, 138, 173] },
  { at: 9.09, rgb: [106, 138, 168] },
  { at: 12.12, rgb: [108, 141, 171] },
  { at: 15.15, rgb: [92, 133, 167] },
  { at: 18.18, rgb: [19, 60, 99] },
  { at: 21.21, rgb: [4, 23, 51] },
  { at: 24.24, rgb: [2, 6, 27] },
  { at: 27.27, rgb: [3, 8, 28] },
  { at: 30.3, rgb: [10, 26, 48] },
  { at: 33.33, rgb: [4, 9, 30] },
  { at: 36.36, rgb: [2, 7, 28] },
  { at: 54.55, rgb: [2, 7, 27] },
  { at: 57.58, rgb: [3, 18, 44] },
  { at: 60.61, rgb: [14, 61, 104] },
  { at: 63.64, rgb: [12, 57, 97] },
  { at: 66.67, rgb: [4, 17, 41] },
  { at: 69.7, rgb: [6, 20, 45] },
  { at: 72.73, rgb: [8, 30, 60] },
  { at: 75.76, rgb: [13, 39, 71] },
  { at: 78.79, rgb: [10, 39, 72] },
  { at: 81.82, rgb: [9, 40, 74] },
  { at: 84.85, rgb: [11, 47, 84] },
  { at: 87.88, rgb: [14, 58, 100] },
  { at: 90.91, rgb: [17, 72, 121] },
  { at: 93.94, rgb: [34, 112, 169] },
  { at: 96.97, rgb: [126, 194, 229] },
  { at: 100, rgb: [153, 209, 238] },
];

/**
 * A surface's two edges, and how far from them its light reaches.
 *
 * The About page is measured the same way but comes out much shorter, because
 * what it is owed is different: the 402 frame is missing eight whole groups,
 * where this page only has its hero tile a little short on the right and its
 * footer band a little short at both ends. Its residual is inside 160px of
 * each edge, so its wash is too — an average taken over 744 rows of the two.
 */
export interface EdgeWashSpec {
  readonly left: readonly EdgeStop[];
  readonly right: readonly EdgeStop[];
  /** Share of the edge value, sampled every {@link EdgeWashSpec.step} px. */
  readonly falloff: readonly number[];
  readonly step: number;
  /**
   * Whether the strip hangs outside the column rather than lying over it.
   *
   * The two page washes make up light the layers inside the column are short
   * of, so they sit on top and add to it. The frame wash is the opposite: it
   * is the light beyond the column, where nothing else paints and there is
   * nothing to add to — so it hangs off the edge and composites normally.
   */
  readonly outside?: boolean;
}

export type EdgeSurface = "mobile" | "about" | "frame";

export const EDGE_WASH: Record<EdgeSurface, EdgeWashSpec> = {
  mobile: { left: LEFT, right: RIGHT, falloff: MOBILE_FALLOFF, step: 10 },
  about: { left: ABOUT_LEFT, right: ABOUT_RIGHT, falloff: ABOUT_FALLOFF, step: 20 },
  frame: { left: FRAME_LEFT, right: FRAME_RIGHT, falloff: FRAME_FALLOFF, step: 20, outside: true },
};
