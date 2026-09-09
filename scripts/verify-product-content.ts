import assert from "node:assert/strict";
import test from "node:test";
import { ProductSectionType } from "@prisma/client";
import { normalizeProductSectionData } from "../src/lib/product-detail";
import { productInputSchema, testimonialInputSchema } from "../src/lib/validation";

test("legacy product arrays normalize into canonical content", () => {
  assert.deepEqual(normalizeProductSectionData(ProductSectionType.METRICS, [{ value: "5 kW", label: "Capacity" }]), [{ value: "5 kW", label: "Capacity" }]);
  assert.deepEqual(normalizeProductSectionData(ProductSectionType.FEATURES, [{ title: "Connected", body: "Wi-Fi" }]), { items: [{ title: "Connected", body: "Wi-Fi" }] });
  assert.deepEqual(normalizeProductSectionData(ProductSectionType.SPECIFICATIONS, [{ specification: "Power", details: "5 kW" }]), { items: [{ specification: "Power", details: "5 kW" }], note: "" });
});

test("invalid empty structured rows are rejected", () => {
  const base = { name: "Kiosk", slug: "kiosk", status: "DRAFT", sortOrder: 0, metrics: [], overviewItems: [], features: [], applications: [], specifications: [], cta: { quoteLabel: "Quote", datasheetLabel: "Datasheet" } };
  assert.equal(productInputSchema.safeParse({ ...base, features: [{ title: "", body: "" }] }).success, false);
});

test("testimonial publication and ordering fields validate", () => {
  assert.equal(testimonialInputSchema.safeParse({ quote: "A dependable engineering partner.", client: "OEM Client", title: "Strong delivery", isPublished: false, sortOrder: 2 }).success, true);
});
