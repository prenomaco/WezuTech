import assert from "node:assert/strict";
import test from "node:test";
import { carouselTabIndex } from "../src/lib/carousel-navigation";

const SLIDE_COUNT = 5;

test("testimonial arrow keys advance and wrap in both directions", () => {
  assert.equal(carouselTabIndex(0, "ArrowRight", SLIDE_COUNT), 1);
  assert.equal(carouselTabIndex(4, "ArrowRight", SLIDE_COUNT), 0);
  assert.equal(carouselTabIndex(4, "ArrowLeft", SLIDE_COUNT), 3);
  assert.equal(carouselTabIndex(0, "ArrowLeft", SLIDE_COUNT), 4);
});

test("Home and End select the first and last testimonial", () => {
  for (let current = 0; current < SLIDE_COUNT; current += 1) {
    assert.equal(carouselTabIndex(current, "Home", SLIDE_COUNT), 0);
    assert.equal(carouselTabIndex(current, "End", SLIDE_COUNT), 4);
  }
});

test("tab navigation leaves native scrolling and focus keys untouched", () => {
  for (const key of ["Tab", "ArrowUp", "ArrowDown", "Enter", " ", "Escape"]) {
    assert.equal(carouselTabIndex(2, key, SLIDE_COUNT), null);
  }
});

test("empty and single-item carousels cannot produce out-of-range tabs", () => {
  for (const key of ["ArrowLeft", "ArrowRight", "Home", "End"]) {
    assert.equal(carouselTabIndex(0, key, 0), null);
    assert.equal(carouselTabIndex(0, key, 1), 0);
  }
});
