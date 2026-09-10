/**
 * Figma node 510:46's hero ellipse group ("BG Fractal Gradience"), extracted
 * from the exported SVGs the same way `field`/`footer`/etc. were: each of the
 * six is a blurred stroked ellipse (not a filled shape), individually
 * `color-dodge`-composited onto the others, with the whole group then
 * `hard-light`-composited against the page. Re-export and re-extract rather
 * than hand-tuning the path data if the design changes.
 */
export interface ProductHeroRing {
  readonly d: string;
  readonly stroke: string;
  readonly strokeWidth: number;
  readonly blur: number;
  /** The exported SVG's own viewBox size — what `d` and `strokeWidth` are drawn against. */
  readonly nativeWidth: number;
  readonly nativeHeight: number;
  /** Placement box, in the shared ellipse-group container's own coordinates. */
  readonly left: number;
  readonly top: number;
  readonly outerWidth: number;
  readonly outerHeight: number;
  /** The rotated child's own box — centred in the placement box, then stretched
   * 115%/110% (see `PRODUCT_HERO_OVERFILL`) before the source is drawn into it. */
  readonly innerWidth: number;
  readonly innerHeight: number;
}

/** Every ring shares this rotation. */
export const PRODUCT_HERO_ROTATE = -117.71;

/** Matches the DOM version's `inset-[-5%_-7.5%] h-[110%] w-[115%]` overfill. */
export const PRODUCT_HERO_OVERFILL = { x: 1.15, y: 1.1 } as const;

export const PRODUCT_HERO_RINGS: readonly ProductHeroRing[] = [
  {
    d: "M681.442 64.127C849.343 64.127 1003.25 162.84 1115.92 326.298C1228.54 489.682 1298.76 716.352 1298.76 967.569C1298.76 1218.79 1228.54 1445.46 1115.92 1608.84C1003.25 1772.3 849.343 1871.01 681.442 1871.01C513.542 1871.01 359.641 1772.3 246.968 1608.84C134.346 1445.46 64.127 1218.79 64.127 967.569C64.1271 716.352 134.346 489.682 246.968 326.298C359.641 162.84 513.542 64.1271 681.442 64.127Z",
    stroke: "white",
    strokeWidth: 34.9783,
    blur: 23.3189,
    nativeWidth: 1362.89,
    nativeHeight: 1935.14,
    left: 9.8,
    top: 101.26,
    outerWidth: 2221,
    outerHeight: 1980.484,
    innerWidth: 1269.61,
    innerHeight: 1841.864,
  },
  {
    d: "M728.08 139.913C883.654 139.913 1029.56 231.35 1138.56 389.479C1247.42 547.41 1316.25 768.142 1316.25 1014.21C1316.25 1260.27 1247.42 1481 1138.56 1638.94C1029.56 1797.06 883.654 1888.5 728.08 1888.5C572.507 1888.5 426.604 1797.06 317.605 1638.94C208.742 1481 139.913 1260.27 139.913 1014.21C139.913 768.142 208.742 547.41 317.605 389.479C426.604 231.35 572.507 139.913 728.08 139.913Z",
    stroke: "#14568A",
    strokeWidth: 93.2756,
    blur: 46.6378,
    nativeWidth: 1456.16,
    nativeHeight: 2028.42,
    left: -15,
    top: 113.02,
    outerWidth: 2221,
    outerHeight: 1980.484,
    innerWidth: 1269.609,
    innerHeight: 1841.864,
  },
  {
    d: "M728.08 100.272C900.418 100.272 1057.2 201.604 1171.2 366.981C1285.17 532.328 1355.89 761.136 1355.89 1014.21C1355.89 1267.28 1285.17 1496.09 1171.2 1661.43C1057.2 1826.81 900.418 1928.14 728.08 1928.14C555.742 1928.14 398.96 1826.81 284.965 1661.43C170.99 1496.09 100.272 1267.28 100.272 1014.21C100.272 761.136 170.99 532.328 284.965 366.981C398.96 201.604 555.742 100.272 728.08 100.272Z",
    stroke: "#14568A",
    strokeWidth: 13.9913,
    blur: 46.6378,
    nativeWidth: 1456.16,
    nativeHeight: 2028.42,
    left: -14.5,
    top: 114.01,
    outerWidth: 2221,
    outerHeight: 1980.484,
    innerWidth: 1269.609,
    innerHeight: 1841.864,
  },
  {
    d: "M728.08 111.931C895.488 111.931 1049.07 210.353 1161.6 373.598C1274.07 536.764 1344.23 763.196 1344.23 1014.21C1344.23 1265.22 1274.07 1491.65 1161.6 1654.82C1049.07 1818.06 895.488 1916.48 728.08 1916.48C560.673 1916.48 407.092 1818.06 294.566 1654.82C182.094 1491.65 111.931 1265.22 111.931 1014.21C111.931 763.196 182.094 536.764 294.566 373.598C407.092 210.353 560.673 111.931 728.08 111.931Z",
    stroke: "#14568A",
    strokeWidth: 37.3102,
    blur: 46.6378,
    nativeWidth: 1456.16,
    nativeHeight: 2028.42,
    left: 176.1,
    top: 13.9,
    outerWidth: 2221,
    outerHeight: 1980.484,
    innerWidth: 1269.61,
    innerHeight: 1841.864,
  },
  {
    d: "M660.385 64.127C822.267 64.127 970.904 161.737 1079.86 323.821C1188.73 485.796 1256.64 710.558 1256.64 959.69C1256.64 1208.82 1188.73 1433.58 1079.86 1595.56C970.904 1757.64 822.267 1855.25 660.385 1855.25C498.503 1855.25 349.867 1757.64 240.915 1595.56C132.037 1433.58 64.1271 1208.82 64.127 959.69C64.127 710.558 132.037 485.796 240.915 323.821C349.867 161.737 498.503 64.1272 660.385 64.127Z",
    stroke: "white",
    strokeWidth: 34.9783,
    blur: 23.3189,
    nativeWidth: 1320.77,
    nativeHeight: 1919.38,
    left: 48.4,
    top: 87.57,
    outerWidth: 2187.458,
    outerHeight: 1935.871,
    innerWidth: 1227.495,
    innerHeight: 1826.103,
  },
  {
    d: "M707.023 111.931C868.022 111.931 1016.35 213.269 1125.32 382.461C1234.18 551.458 1302.12 786.048 1302.12 1046.13C1302.12 1306.21 1234.18 1540.8 1125.32 1709.79C1016.35 1878.99 868.022 1980.32 707.023 1980.32C546.023 1980.32 397.7 1878.99 288.721 1709.79C179.868 1540.8 111.931 1306.21 111.931 1046.13C111.931 786.048 179.868 551.458 288.721 382.461C397.7 213.269 546.023 111.931 707.023 111.931Z",
    stroke: "black",
    strokeWidth: 37.3102,
    blur: 46.6378,
    nativeWidth: 1414.05,
    nativeHeight: 2092.26,
    left: 142.8,
    top: 0.96,
    outerWidth: 2257.929,
    outerHeight: 1972.887,
    innerWidth: 1227.495,
    innerHeight: 1905.704,
  },
];
