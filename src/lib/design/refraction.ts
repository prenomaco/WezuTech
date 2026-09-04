/**
 * Figma's "Pattern refraction" shader, ported to run without a filter.
 *
 * The three background frames (nodes 362:47, 362:85 and 362:92) each carry a
 * WGSL custom effect. It is what produces the hard-edged vertical banding the
 * design shows — not a mask over the light, and not a rendering artefact.
 *
 * The shader builds a ridged height field, takes its normal, refracts a
 * straight-on ray through it and samples the frame at the refracted position.
 * With `patternType: 0` and `angle: 0` the ridges run vertically, so the
 * normal's y component is always zero and the whole effect collapses to a
 * horizontal displacement that depends only on x. So the whole effect is a
 * one-dimensional horizontal remap, `out(x) = in(x + dx(x))`, and
 * {@link refractionLayers} rebuilds it out of shifted copies of the frame
 * rather than out of a filter.
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

/** Samples per ridge used when measuring the ramp. */
const STOPS_PER_PERIOD = 120;

/**
 * How many shifted copies the remap is rebuilt from.
 *
 * `dx` runs a full sawtooth across every period, so `out(x) = in(x + dx(x))`
 * needs the frame sampled at a continuum of offsets. But the frame holds only
 * a glow, whose Gaussian is wider than the +/-20.8px the ray ever travels, so
 * it is near enough linear across that span: sampling it at a few fixed
 * offsets and interpolating between them reproduces the sweep.
 *
 * Four is where it stops paying. Measured against the filter's own output over
 * the hero, mean error per channel is 0.57/255 at two copies, 0.48 at three,
 * 0.45 at four and 0.44 at five, against 0.30 for the exact remap and 1.09 for
 * no refraction at all. The band edges — the part of this that is actually
 * visible — are exact at any count, because they come from the sawtooth's
 * reset, which every mask carries.
 */
const KNOTS = 4;

function ridgeHeight(x: number): number {
  const u = (((x / PATTERN_SIZE) % 1) + 1) % 1;
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

/** Peak |dx| over a period, in frame pixels — the outermost copy's offset. */
function peakDisplacement(): number {
  let peak = 0;
  for (let i = 0; i < STOPS_PER_PERIOD; i += 1) {
    peak = Math.max(peak, Math.abs(refractionDisplacement((i / STOPS_PER_PERIOD) * PATTERN_SIZE)));
  }
  return peak;
}

/** One shifted copy of a refraction frame. */
export interface RefractionLayer {
  /** How far this copy is shifted, in frame pixels. */
  readonly offset: number;
  /**
   * This copy's share of each column, as a CSS `mask-image`.
   *
   * The shares are hat functions over the offsets, so across any column they
   * sum to one. The copies are added rather than painted over one another —
   * see {@link refractionLayers} — so summing to one is what makes the stack
   * an interpolation.
   */
  readonly mask: string;
}

/**
 * The frame's refraction, as copies of it to stack.
 *
 * Each copy is the frame shifted by a fixed `offset`, and each mask is that
 * copy's share of the column — a hat function that peaks where `dx` equals the
 * copy's own offset and falls to nothing at its neighbours'. The shares sum to
 * one everywhere, so the weighted sum of the copies is the frame sampled at
 * `dx`, which is the remap.
 *
 * The copies are *added*, not painted over one another. Stacking them with
 * ordinary source-over compositing would not interpolate: the glow is
 * translucent, and a copy laid over another at mask `m` contributes `a·m` of
 * coverage on top of what is already there rather than replacing `m` of it, so
 * the alpha climbs with every copy and the frame comes out too bright —
 * measured, 3.98 mean error against the filter over the hero, worse than
 * drawing no refraction at all. Adding premultiplied colour with
 * `plus-lighter`, inside a group that isolates it from the page beneath, gives
 * `sum(colour · share)` and `sum(alpha · share)`, which is the interpolation
 * exactly.
 *
 * The masks are `repeating-linear-gradient`s on the ridge period, so they cost
 * a gradient rather than a filter, and the compositor can raster the whole
 * frame once and then merely scroll it. That is the entire point of building
 * it this way: an SVG filter graph carrying `feDisplacementMap` has no
 * compositor implementation in any engine, so Gecko renders it on the CPU as a
 * tiled blob and re-runs it as the displayport moves, which cost 107ms of
 * content paint per frame against 1.2ms without it.
 *
 * The phase is anchored on the design frame's centre, as the shader anchors
 * it. Stops are laid out across one period starting a period behind that
 * anchor, so the pattern lands on the same columns the filter put it on
 * however wide the frame is stretched.
 */
export function refractionLayers(frameWidth: number): readonly RefractionLayer[] {
  const peak = peakDisplacement();
  const phase = (((frameWidth / 2) % PATTERN_SIZE) + PATTERN_SIZE) % PATTERN_SIZE;
  const step = (2 * peak) / (KNOTS - 1);

  return Array.from({ length: KNOTS }, (_, index) => {
    const offset = -peak + step * index;
    const stops: string[] = [];
    for (let i = 0; i <= STOPS_PER_PERIOD; i += 1) {
      const t = (i / STOPS_PER_PERIOD) * PATTERN_SIZE;
      const share = Math.max(0, 1 - Math.abs(refractionDisplacement(t) - offset) / step);
      stops.push(`rgb(0 0 0/${share.toFixed(4)}) ${(phase - PATTERN_SIZE + t).toFixed(3)}px`);
    }

    return { offset, mask: `repeating-linear-gradient(to right,${stops.join(",")})` };
  });
}
