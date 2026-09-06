import assert from "node:assert/strict";
import test from "node:test";
import { GLOW_VECTORS } from "../src/lib/design/glow-vectors";
import {
  PATTERN_SIZE,
  refractionDisplacement,
} from "../src/lib/design/refraction";
import {
  reflectedCoordinate,
  renderRefraction,
  refractionSurfaceSize,
} from "../src/lib/design/render-refraction";
import {
  glowSurfaceGeometry,
  glowSurfaceSvg,
  renderGlow,
} from "../src/lib/design/render-glow";

test("refraction remains finite, bounded and periodic across negative coordinates", () => {
  const sampleCount = 1200;
  const maximumTravel = 90;
  for (let index = -sampleCount; index <= sampleCount; index += 1) {
    const x = (index / sampleCount) * PATTERN_SIZE;
    const displacement = refractionDisplacement(x);
    assert.ok(Number.isFinite(displacement));
    assert.ok(Math.abs(displacement) <= maximumTravel);
    assert.ok(
      Math.abs(displacement - refractionDisplacement(x + PATTERN_SIZE)) < 1e-8,
    );
  }
});

test("wide-screen reflection joins both source edges without a coordinate jump", () => {
  const extent = 402;
  assert.equal(reflectedCoordinate(-1, extent), 1);
  assert.equal(reflectedCoordinate(0, extent), 0);
  assert.equal(reflectedCoordinate(extent, extent), extent);
  assert.equal(reflectedCoordinate(extent + 1, extent), extent - 1);
  assert.equal(reflectedCoordinate(extent * 2, extent), 0);
  for (let x = -extent * 4; x <= extent * 4; x += 1) {
    const sample = reflectedCoordinate(x, extent);
    assert.ok(sample >= 0 && sample <= extent);
    assert.equal(sample, reflectedCoordinate(x + extent * 2, extent));
    assert.ok(Math.abs(sample - reflectedCoordinate(x + 1, extent)) <= 1);
  }
});

test("every light export includes valid dimensions, blur and vector geometry", () => {
  for (const [name, spec] of Object.entries(GLOW_VECTORS)) {
    assert.ok(spec.width > 0 && spec.height > 0, `${name}: dimensions`);
    assert.ok(Number.isFinite(spec.blur) && spec.blur >= 0, `${name}: blur`);
    assert.ok(spec.shapes.length > 0, `${name}: paths`);
    for (const shape of spec.shapes) {
      assert.match(shape.d, /^M/, `${name}: path origin`);
      assert.match(shape.fill, /^#[\da-f]{6}$/i, `${name}: fill`);
    }
  }
});

test("hidden responsive canvases do not allocate a raster", async () => {
  const hiddenCanvas = {
    getBoundingClientRect: () => ({ width: 0, height: 0 }),
    parentElement: null,
  } as unknown as HTMLCanvasElement;
  const box = { left: 0, top: 0, width: 402, height: 233 };
  const painted = await renderRefraction(
    hiddenCanvas,
    { frame: box, glow: { box, vector: "fieldDim" } },
    new AbortController().signal,
  );
  assert.equal(painted, false);
});

test("paired surfaces have identical integer-sized halves at fractional DPR", () => {
  for (const width of [320, 402, 1024, 1512, 1900, 2560, 5120]) {
    for (const dpr of [1, 1.25, 1.5, 2, 3]) {
      const size = refractionSurfaceSize(width, 1295.43, dpr, true);
      assert.equal(size.height % 2, 0);
      assert.ok(size.width <= 4096);
      assert.ok(size.width > 0 && size.height > 0);
      assert.ok(size.density <= 2);
    }
  }
});

test("glow surfaces include a three-sigma margin beyond every original edge", () => {
  for (const spec of Object.values(GLOW_VECTORS)) {
    const box = glowSurfaceGeometry(spec, spec.width, spec.height);
    assert.ok(box.padding >= spec.blur * 3);
    assert.equal(box.width, spec.width + box.padding * 2);
    assert.equal(box.height, spec.height + box.padding * 2);
  }
  const source = glowSurfaceSvg("streakLower", 1686.55, 636.33);
  assert.match(source, /filterUnits="userSpaceOnUse"/);
  assert.match(source, /color-interpolation-filters="sRGB"/);
  assert.ok(
    !source.includes("style="),
    "the decoded source requires no CSS blur",
  );
});

test("cancelled glow draws allocate neither image nor surface", async () => {
  const controller = new AbortController();
  controller.abort();
  assert.equal(
    await renderGlow(
      {} as HTMLCanvasElement,
      "streakLower",
      100,
      100,
      controller.signal,
    ),
    false,
  );
});
