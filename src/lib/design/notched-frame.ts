/**
 * The design's notched panel, in the two sizes it is drawn at.
 *
 * Both are the same shape: a rounded rectangle whose long edge steps up in the
 * middle over two 30-degree chamfers. Figma draws them flipped, so the stepped
 * edge ends up at the bottom, and both are filled `black` at 10% — they darken
 * the page rather than tinting it, which is what gives the recessed look.
 *
 * The stroke is not in the export. Measuring the render shows it is not a full
 * outline either: the sides carry none, and of the long edges only some are
 * lit — each peaking across the middle and fading to nothing at both ends. See
 * `testimonial-frame.ts` for the measurements behind the quote frame's.
 */

/** One lit edge, and how bright it peaks across the middle of that edge. */
export interface LitEdge {
  readonly edge: "top" | "bottom";
  /** Peak alpha of #dafaf5, measured off the render. */
  readonly alpha: number;
}

export interface FramePath {
  readonly width: number;
  readonly height: number;
  readonly d: string;
  /** The edges the render actually lights; the rest carry no stroke. */
  readonly lit: readonly LitEdge[];
  /**
   * Stroke width in the shape's own units.
   *
   * A lit edge runs along the very boundary of the viewBox, so a 1px stroke
   * centred on it has half its width clipped away by the SVG viewport and
   * renders at half strength. Drawing it 2 wide leaves exactly 1 visible, at
   * the alpha actually measured. The quote frame predates this and carries the
   * clipping in its alpha instead.
   */
  readonly strokeWidth?: number;
  /** The design draws this shape flipped from how it was exported. */
  readonly flipY: boolean;
  /**
   * Fill this shape opaquely rather than as 10% black over whatever is behind.
   *
   * The capsule overlaps the frame, and the frame's lit bottom edge runs
   * straight through where the capsule sits. In the design that edge stops at
   * the capsule and picks up again on the other side, which only happens if
   * the capsule is opaque. The value is the same colour the translucent fill
   * resolves to over the page — measured off the render at (2,6,25), the ink
   * at exactly 0.9 — so nothing about the shape's own appearance changes.
   */
  readonly opaqueFill?: string;
}

/**
 * Node 374:264 ("Vector 42") — the panel behind "How we work" on the About
 * page, 1240 x 461. Figma reports its box after the flip, so the placement is
 * the reported x minus the width and y minus the height: 136, 824.
 */
export const CAPABILITIES_PANEL: FramePath = {
  width: 1240,
  height: 461,
  /* Both long edges are lit here, unlike the quote frame. Down the sides the
     page reads 7.5/255, the ink untouched; along the top the stroke peaks at
     89/255 and along the bottom at 106. */
  lit: [
    { edge: "top", alpha: 0.34 },
    { edge: "bottom", alpha: 0.42 },
  ],
  strokeWidth: 2,
  flipY: true,
  d:
    "M622.861 0H1075.97C1080.11 0 1084.22 0.791367 1088.06 2.33155L1158.98 30.7342" +
    "C1162.82 32.2744 1166.93 33.0658 1171.07 33.0658H1207.48C1225.44 33.0658 1240 47.6268 1240 65.5889" +
    "V428.477C1240 446.439 1225.44 461 1207.48 461H622.861H617.139H32.5231" +
    "C14.5611 461 0 446.439 0 428.477L0 65.5888C0 47.6268 14.5611 33.0658 32.5231 33.0658H68.9302" +
    "C73.0726 33.0658 77.1769 32.2744 81.0224 30.7342L151.937 2.33155" +
    "C155.783 0.79137 159.887 0 164.03 0H617.139H622.861Z",
};
