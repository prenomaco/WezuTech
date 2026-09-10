import {
  PRODUCT_HERO_OVERFILL,
  PRODUCT_HERO_RINGS,
  PRODUCT_HERO_ROTATE,
  type ProductHeroRing,
} from "@/lib/design/product-hero-vectors";

/** Matches the low-frequency-content optimisation in `render-glow.ts`. */
const RASTER_SCALE = 0.5;
const BLUR_MARGIN_SIGMAS = 3;

function ringPadding(ring: ProductHeroRing): number {
  return Math.ceil(ring.blur * BLUR_MARGIN_SIGMAS);
}

/** One ring's own blurred-stroke SVG, at its native size plus blur margin. */
function ringSvg(ring: ProductHeroRing): string {
  const pad = ringPadding(ring);
  const width = ring.nativeWidth + pad * 2;
  const height = ring.nativeHeight + pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(width * RASTER_SCALE)}" height="${Math.ceil(height * RASTER_SCALE)}" viewBox="${-pad} ${-pad} ${width} ${height}">
    <defs><filter id="f" filterUnits="userSpaceOnUse" x="${-pad}" y="${-pad}" width="${width}" height="${height}" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${ring.blur}"/></filter></defs>
    <path d="${ring.d}" fill="none" stroke="${ring.stroke}" stroke-width="${ring.strokeWidth}" filter="url(#f)"/>
  </svg>`;
}

async function decodeRing(ring: ProductHeroRing): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(new Blob([ringSvg(ring)], { type: "image/svg+xml" }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Draws the six-ring hero field onto `canvas`, sized to `width` x `height` —
 * the shared ellipse-group container's own box, in the same coordinates
 * `ProductHeroRing.left/top` are written against.
 *
 * Each ring is drawn with `globalCompositeOperation: "color-dodge"`, the
 * canvas equivalent of the DOM version's per-ellipse `mix-blend-color-dodge`
 * — they composite against each other exactly as before. The group's own
 * `mix-blend-hard-light` against the page stays a CSS property on the
 * `<canvas>` element itself; canvas has no notion of what's *behind* it.
 */
export async function renderProductHeroField(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  signal: AbortSignal,
): Promise<boolean> {
  if (signal.aborted) return false;
  canvas.width = Math.ceil(width * RASTER_SCALE);
  canvas.height = Math.ceil(height * RASTER_SCALE);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is unavailable");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const ring of PRODUCT_HERO_RINGS) {
    const image = await decodeRing(ring);
    if (signal.aborted) return false;

    const pad = ringPadding(ring);
    /* The DOM version stretches the raw asset (its own native size) to
       `innerWidth * overfill` disregarding aspect ratio (`object-fill`), so
       the padding baked around the ring is stretched by the same factor. */
    const scaleX = (ring.innerWidth * PRODUCT_HERO_OVERFILL.x) / ring.nativeWidth;
    const scaleY = (ring.innerHeight * PRODUCT_HERO_OVERFILL.y) / ring.nativeHeight;
    const drawWidth = (ring.nativeWidth + pad * 2) * scaleX * RASTER_SCALE;
    const drawHeight = (ring.nativeHeight + pad * 2) * scaleY * RASTER_SCALE;

    /* The placement box centres the (unrotated) inner box, which the rotation
       then turns in place — so the rotation pivot is simply the placement
       box's own centre. */
    const centerX = (ring.left + ring.outerWidth / 2) * RASTER_SCALE;
    const centerY = (ring.top + ring.outerHeight / 2) * RASTER_SCALE;

    ctx.save();
    ctx.globalCompositeOperation = "color-dodge";
    ctx.translate(centerX, centerY);
    ctx.rotate((PRODUCT_HERO_ROTATE * Math.PI) / 180);
    ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }

  return true;
}
