import type {
  GlowBox,
  GlowLayerProps,
} from "@/components/atmosphere/glow-layer";
import { GLOW_VECTORS, type GlowVectorSpec } from "@/lib/design/glow-vectors";
import { refractionDisplacement } from "@/lib/design/refraction";

/** The light has no fine detail; only the output's ridge edges need full resolution. */
const SOURCE_SCALE = 0.5;
const EDGE_FADE = 120;
const MAX_SURFACE_WIDTH = 4096;
const PAGE_INK = [2, 7, 28] as const;

/** Preserve the exact colour over page ink without an opaque ink rectangle.
 * The exported union paints page-coloured pixels over the glow. Retaining that
 * coverage hides independent edge streaks, exposing the tile's rectangular edge.
 */
function releaseInk(context: CanvasRenderingContext2D) {
  const pixels = context.getImageData(
    0,
    0,
    context.canvas.width,
    context.canvas.height,
  );
  const values = pixels.data;
  for (let offset = 0; offset < values.length; offset += 4) {
    const red = Math.max(0, values[offset] - PAGE_INK[0]);
    const green = Math.max(0, values[offset + 1] - PAGE_INK[1]);
    const blue = Math.max(0, values[offset + 2] - PAGE_INK[2]);
    const coverage = Math.max(red / 253, green / 248, blue / 227);
    if (!coverage) {
      values[offset + 3] = 0;
      continue;
    }
    values[offset] = PAGE_INK[0] + red / coverage;
    values[offset + 1] = PAGE_INK[1] + green / coverage;
    values[offset + 2] = PAGE_INK[2] + blue / coverage;
    values[offset + 3] *= coverage;
  }
  context.putImageData(pixels, 0, 0);
}

export interface RefractionDrawing {
  readonly frame: GlowBox;
  readonly glow: GlowLayerProps;
  readonly flipY?: boolean;
  readonly mirrorY?: boolean;
  readonly bleed?: boolean;
  readonly phaseOffset?: number;
}

function sourceSvg({ frame, glow }: RefractionDrawing): string {
  const spec: GlowVectorSpec = GLOW_VECTORS[glow.vector];
  const width = glow.render?.width ?? spec.width;
  const height = glow.render?.height ?? spec.height;
  const xScale = glow.relativeTo ? frame.width / glow.relativeTo : 1;
  const x = (glow.box.left + (glow.box.width - width) / 2) * xScale;
  const y = glow.box.top + (glow.box.height - height) / 2;
  const paths = spec.shapes
    .map(({ d, fill }) => `<path d="${d}" fill="${fill}"/>`)
    .join("");
  // Explicit sRGB matches the CSS blur. This SVG is decoded once into an offscreen
  // source, so its filter never participates in the scrolling display list.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(frame.width * SOURCE_SCALE)}" height="${Math.ceil(frame.height * SOURCE_SCALE)}" viewBox="0 0 ${frame.width} ${frame.height}">
    <defs><filter id="blur" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${spec.blur}"/></filter></defs>
    <g transform="translate(${x} ${y}) scale(${(width * xScale) / spec.width} ${height / spec.height})" opacity="${spec.opacity ?? 1}"><g filter="url(#blur)">${paths}</g></g>
  </svg>`;
}

async function rasterize(
  drawing: RefractionDrawing,
): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(
    new Blob([sourceSvg(drawing)], { type: "image/svg+xml" }),
  );
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const source = document.createElement("canvas");
    source.width = image.naturalWidth;
    source.height = image.naturalHeight;
    const context = source.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas 2D is unavailable");
    context.drawImage(image, 0, 0);
    releaseInk(context);
    return source;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Mirror coordinates, not DOM layers, so the continuation has no tile joints. */
export function reflectedCoordinate(value: number, extent: number): number {
  const period = extent * 2;
  const position = ((value % period) + period) % period;
  return position <= extent ? position : period - position;
}

function smoothstep(value: number): number {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

/** Taper only the invented wide-screen wings, never the designed frame. */
function fadeContinuation(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  inset: number,
  scale: number,
) {
  if (inset <= 0) return;
  const fade = Math.min(height / 2, EDGE_FADE * scale);
  context.globalCompositeOperation = "destination-out";
  for (let x = 0; x < inset; x += 1) {
    const strength = smoothstep((inset - x) / (EDGE_FADE * scale));
    const ramp = context.createLinearGradient(0, height - fade, 0, height);
    ramp.addColorStop(0, "transparent");
    ramp.addColorStop(1, `rgb(0 0 0 / ${strength})`);
    context.fillStyle = ramp;
    context.fillRect(x, height - fade, 1, fade);
    context.fillRect(width - x - 1, height - fade, 1, fade);
  }
  context.globalCompositeOperation = "source-over";
}

function drawColumns(
  context: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  drawing: RefractionDrawing,
  frameWidth: number,
) {
  const { width } = context.canvas;
  const height = context.canvas.height / (drawing.mirrorY ? 2 : 1);
  const scale = frameWidth / drawing.frame.width;
  const inset = (width - frameWidth) / 2;
  const sourceScale = source.width / drawing.frame.width;
  context.save();
  if (drawing.flipY) {
    context.translate(0, height);
    context.scale(1, -1);
  }
  for (let x = 0; x < width; x += 1) {
    const local = (x + 0.5 - inset) / scale;
    const sample =
      local +
      refractionDisplacement(
        local - drawing.frame.width / 2 - (drawing.phaseOffset ?? 0),
      );
    if (!drawing.bleed && (sample < 0 || sample >= drawing.frame.width))
      continue;
    const reflected = drawing.bleed
      ? reflectedCoordinate(sample, drawing.frame.width)
      : sample;
    const sourceX = Math.min(
      source.width - 1,
      Math.max(0, reflected * sourceScale - 0.5),
    );
    context.drawImage(source, sourceX, 0, 1, source.height, x, 0, 1, height);
  }
  context.restore();
  if (drawing.mirrorY) mirrorSurface(context, height);
  if (drawing.bleed && !drawing.mirrorY)
    fadeContinuation(context, width, height, inset, scale);
}

/** Copy the same last pixel row across the join; no fractional DOM tile edges. */
function mirrorSurface(context: CanvasRenderingContext2D, height: number) {
  const { canvas } = context;
  context.save();
  context.translate(0, canvas.height);
  context.scale(1, -1);
  context.drawImage(
    canvas,
    0,
    0,
    canvas.width,
    height,
    0,
    0,
    canvas.width,
    height,
  );
  context.restore();
}

/** Mirrored pairs need an even pixel height, including fractional DPR/zoom. */
export function refractionSurfaceSize(
  width: number,
  height: number,
  dpr: number,
  mirrorY = false,
) {
  const density = Math.min(dpr || 1, 2, MAX_SURFACE_WIDTH / width);
  const rows = mirrorY ? 2 : 1;
  return {
    width: Math.ceil(width * density),
    height: Math.ceil((height * density) / rows) * rows,
    density,
  };
}

/** No animation loop or scroll handler: one draw when the visible box changes size. */
export async function renderRefraction(
  canvas: HTMLCanvasElement,
  drawing: RefractionDrawing,
  signal: AbortSignal,
): Promise<boolean> {
  const bounds = canvas.getBoundingClientRect();
  const frameWidth = canvas.parentElement?.getBoundingClientRect().width ?? 0;
  if (!bounds.width || !bounds.height || !frameWidth) return false;
  const size = refractionSurfaceSize(
    bounds.width,
    bounds.height,
    devicePixelRatio,
    drawing.mirrorY,
  );
  const source = await rasterize(drawing);
  if (signal.aborted) return false;
  // Resize only after the new source is ready, preserving the previous drawing.
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable");
  drawColumns(context, source, drawing, frameWidth * size.density);
  return true;
}
