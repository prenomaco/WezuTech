/**
 * The wide light band that crosses the page around y=2450.
 *
 * Figma builds it from Frames 6 and 7, but their exported tile does not
 * reproduce it: measured at x=60 the design peaks at y=2480 and falls to the
 * ink floor 200px later, while the tile peaks 160px lower, twice as hot, and
 * stays lit for twice as long. So the band is described here by what the render
 * actually does.
 *
 * It is unlike the rest of the page edge in two ways: it reaches ~300px inward
 * rather than ~90, and it peaks *inside* the frame at x=35 rather than at the
 * edge. Both are why it needs its own element instead of a wider rim.
 */

/** Peak layer colour at x=35, y=2480: (24,78,125) with the page ink removed. */
export const BAND_COLOR = "22 71 97";

/** Frame coordinates of the band's box, and how far it reaches inward. */
export const BAND_BOX = { top: 2240, height: 480, reach: 320 } as const;

/** [position across the reach as a percentage, share of the peak] */
export const BAND_ACROSS: readonly (readonly [number, number])[] = [
  [0, 0.8],
  [3.1, 0.86],
  [6.3, 0.94],
  [10.9, 1],
  [17.2, 0.98],
  [25, 0.91],
  [34.4, 0.87],
  [46.9, 0.5],
  [59.4, 0.36],
  [75, 0.18],
  [93.8, 0.03],
  [100, 0],
];

/** [position down the band as a percentage, share of the peak] */
export const BAND_DOWN: readonly (readonly [number, number])[] = [
  [0, 0.14],
  [8.3, 0.2],
  [16.7, 0.32],
  [25, 0.54],
  [33.3, 0.76],
  [41.7, 0.96],
  [50, 1],
  [58.3, 0.79],
  [66.7, 0.59],
  [75, 0.39],
  [83.3, 0.25],
  [91.7, 0.18],
  [100, 0],
];
