/**
 * Figma "Group 12" — the light field behind the hero, and again behind the
 * products and testimonials bands (nodes 255:67, 267:592, 267:599).
 *
 * The design builds this from four solid vector shapes inside a group that is
 * Gaussian-blurred (stdDeviation 56.2) and composited with `mix-blend-mode:
 * screen`. The last shape is filled with the page ink and painted over the
 * bright ones, which is what carves the dark waist through the middle — a
 * plain CSS gradient cannot reproduce that silhouette.
 *
 * Inlined rather than referenced as a file: it is vector-only, under 2KB, and
 * this way the fills stay editable design tokens instead of baked pixels.
 */
const SHAPES = [
  {
    id: "haze",
    fill: "#14568A",
    d:
      "M162.227 1065.53V883.071C256.019 797.451 414.199 697.862 616.701 644.122C470.102 606.418 317.022 543.081 162.227 445.689L162.227 236.548" +
      "C429.039 522.472 1044.04 891.842 1737.59 236.548L1748.52 422.292C1690.09 498.384 1514.8 605.935 1271.55 658.501" +
      "C1413.9 701.686 1563.6 773.521 1717.62 883.071L1748.52 1093.17C1489.81 798.417 810.349 380.239 162.227 1065.53Z",
  },
  {
    id: "highlight",
    fill: "#93C6EA",
    d:
      "M140.767 932.253L162.232 714.994C212.878 689.782 288.972 669.846 383.825 655.43C281.768 642.717 188.867 618.435 112.401 576.999L162.232 376.59" +
      "C385.375 549.946 1015.84 792.643 1752.58 376.59V606.602C1654.12 634.456 1531.26 581.797 1378.38 606.602" +
      "C1289.06 612.037 1186.3 623.217 1077.43 634.503C1301.58 646.076 1541 672.585 1769.29 714.994L1752.58 896.656" +
      "C1492.58 718.99 789.055 505.854 140.767 932.253Z",
  },
  {
    id: "sheen",
    fill: "#7FA4C3",
    d:
      "M162.232 428.5V841.052C659.97 534.025 1428.44 686.197 1758.65 818.138V457.88C1138.05 774.54 435.789 560.442 162.232 428.5Z",
  },
  {
    id: "waist",
    fill: "#02071C",
    d:
      "M220.579 1015.46C450.784 779.177 1183.55 467.85 1758.65 1173.19V1215.4C1499.67 883.652 830.459 444.08 181.671 1215.4L220.579 1015.46Z" +
      "M1728.26 225.701C1598.16 416.199 790.822 957.704 181.671 225.701V112.401C448.757 434.218 1064.39 849.958 1758.65 112.401L1728.26 225.701Z",
  },
] as const;

/** Native size of the exported group, including the room the blur needs. */
export const GLOW_FIELD = { width: 1881.69, height: 1327.81, blur: 46 } as const;

/**
 * `className` positions the field; callers give it the Figma rect for their
 * band. It is inert decoration and is hidden from assistive technology.
 */
interface GlowFieldProps {
  readonly className?: string;
  /** Unique per instance: the blur filter is referenced by id. */
  readonly id: string;
  /** Parallax travel, read by the motion layer. */
  readonly "data-glow-depth"?: number | string;
}

export function GlowField({ className, id, ...rest }: GlowFieldProps) {
  const filterId = `glow-field-blur-${id}`;
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute mix-blend-screen ${className ?? ""}`}
      fill="none"
      preserveAspectRatio="none"
      viewBox={`0 0 ${GLOW_FIELD.width} ${GLOW_FIELD.height}`}
      {...rest}
    >
      <g filter={`url(#${filterId})`}>
        {SHAPES.map((shape) => (
          <path d={shape.d} fill={shape.fill} key={shape.id} />
        ))}
      </g>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height={GLOW_FIELD.height}
          id={filterId}
          width={GLOW_FIELD.width}
          x="0"
          y="0"
        >
          <feGaussianBlur stdDeviation={GLOW_FIELD.blur} />
        </filter>
      </defs>
    </svg>
  );
}
