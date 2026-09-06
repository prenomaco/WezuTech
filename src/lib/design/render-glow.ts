import {
  GLOW_VECTORS,
  type GlowVectorName,
  type GlowVectorSpec,
} from "@/lib/design/glow-vectors";

/** These surfaces contain only low-frequency light, never text or ridge edges. */
const RASTER_SCALE = 0.5;
const BLUR_MARGIN_SIGMAS = 3;

export function glowSurfaceGeometry(
  spec: GlowVectorSpec,
  width: number,
  height: number,
) {
  const blur = (spec.blur * width) / spec.width;
  const padding = Math.ceil(blur * BLUR_MARGIN_SIGMAS);
  return {
    blur,
    padding,
    width: width + padding * 2,
    height: height + padding * 2,
  };
}

/** Match the former CSS blur in target coordinates, with room for its full tail. */
export function glowSurfaceSvg(
  vector: GlowVectorName,
  width: number,
  height: number,
): string {
  const spec: GlowVectorSpec = GLOW_VECTORS[vector];
  const box = glowSurfaceGeometry(spec, width, height);
  const paths = spec.shapes
    .map(({ d, fill }) => `<path d="${d}" fill="${fill}"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(box.width * RASTER_SCALE)}" height="${Math.ceil(box.height * RASTER_SCALE)}" viewBox="${-box.padding} ${-box.padding} ${box.width} ${box.height}" preserveAspectRatio="none">
    <defs><filter id="glow" filterUnits="userSpaceOnUse" x="${-box.padding}" y="${-box.padding}" width="${box.width}" height="${box.height}" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${box.blur}"/></filter></defs>
    <g filter="url(#glow)" opacity="${spec.opacity ?? 1}"><g transform="scale(${width / spec.width} ${height / spec.height})">${paths}</g></g>
  </svg>`;
}

/** Decode the complete blur once, before any scrolling or CSS rotation happens. */
export async function renderGlow(
  canvas: HTMLCanvasElement,
  vector: GlowVectorName,
  width: number,
  height: number,
  signal: AbortSignal,
): Promise<boolean> {
  if (signal.aborted) return false;
  const url = URL.createObjectURL(
    new Blob([glowSurfaceSvg(vector, width, height)], {
      type: "image/svg+xml",
    }),
  );
  try {
    const source = new Image();
    source.src = url;
    await source.decode();
    if (signal.aborted) return false;
    canvas.width = source.naturalWidth;
    canvas.height = source.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D is unavailable");
    context.drawImage(source, 0, 0);
    return true;
  } finally {
    URL.revokeObjectURL(url);
  }
}
