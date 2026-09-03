/**
 * The dark plate behind the header, in both of the design's sizes.
 *
 * Each is a vector rotated 180deg so its *bottom* edge lands on the header's
 * baseline, which is why the corners read as long chamfers rather than radii.
 * Both bleed past the frame on purpose — the desktop plate is 1611 wide inside
 * a 1512 frame, the mobile one 472 inside 402.
 *
 * The paths are inlined rather than fetched: each is under 1KB and carries a
 * gradient stroke that fades to nothing at both ends, which a flat border
 * colour cannot express.
 *
 * Values taken verbatim from the inspector:
 *   fill   rgba(16, 17, 19, 0.50)
 *   stroke 1px, #DAFAF5 at 0 / 1 / 0 alpha across the width
 */

/** Node 252:446 ("Vector 3"), 1611 x 415, sitting on y=106 of the 1512 frame. */
const DESKTOP_PATH =
  "M809.717 0.5H1389.22C1399.94 0.5 1409.84 6.21606 1415.2 15.4956L1505.14 171.209" +
  "C1510.5 180.489 1520.4 186.205 1531.12 186.205H1581.5C1598.07 186.205 1611.5 199.636 1611.5 216.205" +
  "V385.5C1611.5 402.069 1598.07 415.5 1581.5 415.5H809.717H802.283H30.5" +
  "C13.9314 415.5 0.5 402.069 0.5 385.5V216.205C0.5 199.636 13.9315 186.205 30.5 186.205H80.8836" +
  "C91.5997 186.205 101.502 180.489 106.862 171.209L196.798 15.4956" +
  "C202.158 6.21607 212.06 0.5 222.776 0.5H802.283H809.717Z";

/** Node 305:49 ("Vector 54"), 472 x 321, sitting on y=101 of the 402 frame. */
const MOBILE_PATH =
  "M237.589 0.5H388.304C402.402 0.5 414.597 10.3162 417.61 24.0884L441.147 131.671" +
  "C442.74 138.952 449.187 144.142 456.64 144.142C465.399 144.142 472.5 151.242 472.5 160.001" +
  "V291.5C472.5 308.069 459.069 321.5 442.5 321.5H237.589H235.411H30.5" +
  "C13.9314 321.5 0.5 308.069 0.5 291.5V160.001C0.5 151.242 7.60066 144.142 16.3598 144.142" +
  "C23.8127 144.142 30.2602 138.952 31.8531 131.671L55.3896 24.0884" +
  "C58.4026 10.3162 70.5985 0.5 84.6964 0.5H235.411H237.589Z";

interface PlateVariant {
  readonly id: string;
  readonly path: string;
  readonly viewBox: string;
  /** Stroke gradient endpoints, in the vector's own coordinates. */
  readonly x1: number;
  readonly x2: number;
  readonly y: number;
  /** Placement against the frame, as the design measures it. */
  readonly className: string;
}

const PLATES: readonly PlateVariant[] = [
  {
    id: "header-plate-mobile",
    path: MOBILE_PATH,
    viewBox: "0 0 473 322",
    x1: 472.5,
    x2: 0.5,
    y: 161,
    /* 472 wide in a 402 frame, bottom edge on y=101. */
    className: "h-[20.0625rem] w-[117.4129%] top-[-13.75rem] lg:hidden",
  },
  {
    id: "header-plate-desktop",
    path: DESKTOP_PATH,
    viewBox: "0 0 1612 416",
    x1: 1611.5,
    x2: 0.5,
    y: 208,
    className: "hidden h-[25.9375rem] w-[106.5476%] top-[-19.3125rem] lg:block",
  },
];

export function HeaderPlate() {
  return (
    <>
      {PLATES.map((plate) => (
        <svg
          aria-hidden="true"
          className={`absolute left-1/2 -translate-x-1/2 rotate-180 ${plate.className}`}
          fill="none"
          key={plate.id}
          preserveAspectRatio="none"
          viewBox={plate.viewBox}
        >
          <path
            clipRule="evenodd"
            d={plate.path}
            fill="#101113"
            fillOpacity="0.5"
            fillRule="evenodd"
            stroke={`url(#${plate.id}-stroke)`}
            vectorEffect="non-scaling-stroke"
          />
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id={`${plate.id}-stroke`}
              x1={plate.x1}
              x2={plate.x2}
              y1={plate.y}
              y2={plate.y}
            >
              <stop stopColor="#DAFAF5" stopOpacity="0" />
              <stop offset="0.5" stopColor="#DAFAF5" />
              <stop offset="1" stopColor="#DAFAF5" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      ))}
    </>
  );
}
