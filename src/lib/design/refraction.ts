/**
 * Figma's "Pattern refraction" shader, ported to run as an SVG filter.
 *
 * The three background frames (nodes 362:47, 362:85 and 362:92) each carry a
 * WGSL custom effect. It is what produces the hard-edged vertical banding the
 * design shows — not a mask over the light, and not a rendering artefact.
 *
 * The shader builds a ridged height field, takes its normal, refracts a
 * straight-on ray through it and samples the frame at the refracted position.
 * With `patternType: 0` and `angle: 0` the ridges run vertically, so the
 * normal's y component is always zero and the whole effect collapses to a
 * horizontal displacement that depends only on x. That is reproducible exactly
 * with `feDisplacementMap` driven by a horizontal ramp, which is what
 * {@link refractionMapSvg} builds.
 *
 * Shader parameters as the file stores them:
 *   patternType 0, angle 0, radius 4, amount 9, seamlessness 34,
 *   frost 0, iorDispersion 0, pixelWrapMode 0
 */

/** `20 + radius/100 * 980` — the ridge period, in frame pixels. */
export const PATTERN_SIZE = 59.2;

/** `amount * 10` — how far a refracted ray may travel, in pixels. */
const AMOUNT = 90;

/** `seamlessness / 100`, the exponent the height field is sharpened by. */
const SEAMLESSNESS = 0.34;

/** Water, as the shader hard-codes it; dispersion is off so all three match. */
const IOR = 1.333;

/** The shader's finite-difference step, in pixels. */
const DERIVATIVE_STEP = 0.125;

/** The z the shader gives the normal before normalising. */
const NORMAL_Z = 0.0125;

/** The shader supersamples 6x6; only the x offsets matter here. */
const MSAA = 6;

/**
 * Peak displacement is a little over 20px either way. The map encodes
 * `0.5 + dx / DISPLACEMENT_SCALE`, so this has to stay comfortably above that
 * or the ramp clips.
 */
export const DISPLACEMENT_SCALE = 44;

/** Samples per ridge. At ~0.5px apart this resolves the reset cleanly. */
const STOPS_PER_PERIOD = 120;

function ridgeHeight(x: number): number {
  const u = ((x / PATTERN_SIZE) % 1 + 1) % 1;
  const s = Math.min(1, Math.max(0, Math.sin(Math.PI * u)));
  const h = s ** 0.7;
  return h * h ** SEAMLESSNESS;
}

/**
 * The shader's refraction, for a single sample.
 *
 * `refract` returns the zero vector under total internal reflection, which is
 * what happens across most of each ridge — those columns are left where they
 * are, and the rest slide, which is where the hard seams come from.
 */
function displacementAt(x: number): number {
  const slope = ridgeHeight(x) - ridgeHeight(x + DERIVATIVE_STEP);
  const length = Math.hypot(slope, NORMAL_Z);
  const normalX = slope / length;
  const incident = -(NORMAL_Z / length);

  const k = 1 - IOR * IOR * (1 - incident * incident);
  if (k < 0) return 0;

  return -(IOR * incident + Math.sqrt(k)) * normalX * AMOUNT;
}

/** The supersampled displacement at a frame x, in pixels. */
export function refractionDisplacement(x: number): number {
  let total = 0;
  for (let i = 0; i < MSAA; i += 1) {
    total += displacementAt(x + i / MSAA - (MSAA - 1) / MSAA / 2);
  }
  return total / MSAA;
}

/**
 * A displacement map for one frame width, as an SVG data URI.
 *
 * The ramp is periodic, so the document carries a single ridge in a `<pattern>`
 * and lets it tile — a full-width ramp would be tens of thousands of stops. The
 * shader anchors its pattern on the frame's centre, so the tile is offset by
 * where that centre falls within a period.
 *
 * Red carries the horizontal displacement and green sits at the neutral 0.5,
 * since the vertical component is always zero.
 */
export function refractionMapSvg(frameWidth: number): string {
  const stops: string[] = [];
  for (let i = 0; i <= STOPS_PER_PERIOD; i += 1) {
    const offset = i / STOPS_PER_PERIOD;
    const dx = refractionDisplacement(offset * PATTERN_SIZE);
    const red = Math.round(255 * Math.min(1, Math.max(0, 0.5 + dx / DISPLACEMENT_SCALE)));
    stops.push(`<stop offset="${(offset * 100).toFixed(3)}%" stop-color="rgb(${red},128,0)"/>`);
  }

  const phase = ((frameWidth / 2) % PATTERN_SIZE) - PATTERN_SIZE;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${frameWidth}" height="1">`,
    "<defs>",
    `<linearGradient id="r" x1="0" y1="0" x2="1" y2="0">${stops.join("")}</linearGradient>`,
    `<pattern id="p" x="${phase.toFixed(4)}" y="0" width="${PATTERN_SIZE}" height="1"`,
    ' patternUnits="userSpaceOnUse">',
    `<rect width="${PATTERN_SIZE}" height="1" fill="url(#r)"/>`,
    "</pattern>",
    "</defs>",
    `<rect width="${frameWidth}" height="1" fill="url(#p)"/>`,
    "</svg>",
  ].join("");
}

/** The same document as a data URI, ready for `feImage`'s href. */
export function refractionMapUri(frameWidth: number): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(refractionMapSvg(frameWidth))}`;
}
