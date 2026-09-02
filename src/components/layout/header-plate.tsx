/**
 * Figma "Vector 3" (node 252:446) — the dark plate behind the header.
 *
 * The design places a 1611 x 415 vector rotated 180deg so its bottom edge lands
 * on y=106, which is why the corners read as long 30deg chamfers rather than
 * rounded corners. The node is wider than the 1512 frame and deliberately
 * bleeds ~49.5px past each edge.
 *
 * The path is inlined rather than fetched as an asset: it is under 1KB, it
 * carries a gradient stroke that fades to nothing at both ends (a flat border
 * colour cannot express that), and inlining costs no extra request.
 *
 * Values are taken verbatim from the Figma inspector:
 *   fill   rgba(16, 17, 19, 0.50)
 *   stroke 1px, linear-gradient #DAFAF5 0% -> 50% -> 100% at 0 / 1 / 0 alpha
 */
const PLATE_PATH =
  "M809.717 0.5H1389.22C1399.94 0.5 1409.84 6.21606 1415.2 15.4956L1505.14 171.209" +
  "C1510.5 180.489 1520.4 186.205 1531.12 186.205H1581.5C1598.07 186.205 1611.5 199.636 1611.5 216.205" +
  "V385.5C1611.5 402.069 1598.07 415.5 1581.5 415.5H809.717H802.283H30.5" +
  "C13.9314 415.5 0.5 402.069 0.5 385.5V216.205C0.5 199.636 13.9315 186.205 30.5 186.205H80.8836" +
  "C91.5997 186.205 101.502 180.489 106.862 171.209L196.798 15.4956" +
  "C202.158 6.21607 212.06 0.5 222.776 0.5H802.283H809.717Z";

export function HeaderPlate() {
  return (
    <svg
      aria-hidden="true"
      className="absolute left-1/2 top-[-19.3125rem] h-[25.9375rem] w-[106.5476%] -translate-x-1/2 rotate-180"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 1612 416"
    >
      <path
        clipRule="evenodd"
        d={PLATE_PATH}
        fill="#101113"
        fillOpacity="0.5"
        fillRule="evenodd"
        stroke="url(#header-plate-stroke)"
        vectorEffect="non-scaling-stroke"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="header-plate-stroke"
          x1="1611.5"
          x2="0.5"
          y1="208"
          y2="208"
        >
          <stop stopColor="#DAFAF5" stopOpacity="0" />
          <stop offset="0.5" stopColor="#DAFAF5" />
          <stop offset="1" stopColor="#DAFAF5" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
