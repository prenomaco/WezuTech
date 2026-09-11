"use client";

import { useState } from "react";
import { CategoryGrid } from "@/components/products/category-grid";
import { PRODUCT_GRID, ProductCard } from "@/components/products/product-card";
import { SectionHeading } from "@/components/ui/typography";
import type { CatalogProduct } from "@/lib/catalog";

/**
 * The index's two ways in: browse by application area, or see the whole
 * catalogue.
 *
 * Categories are the default because that is how the site talks about the
 * work everywhere else, and because a visitor who knows which vehicle they
 * are building for can get to the shortlist in one click. "Show all products"
 * is the escape hatch for the visitor who would rather scan everything, so it
 * is a toggle on this page rather than a second page to navigate to — the
 * catalogue is already loaded either way.
 */
const TOGGLE =
  "press inline-flex items-center gap-2 rounded-control border px-5 py-[0.625rem] " +
  "text-[1.125rem] leading-[1.5rem] transition-[background-color,border-color,color] duration-300 ease-out";

const TOGGLE_STATE = {
  on: "border-sky bg-sky text-white hover:bg-sky-bright",
  off: "border-white/40 text-ice hover:border-white hover:bg-white/10",
} as const;

export function ProductIndex({ products, counts }: {
  readonly products: readonly CatalogProduct[];
  readonly counts: Readonly<Record<string, number>>;
}) {
  const [showAll, setShowAll] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-[0.875rem] sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading as="h2" data-motion="products-heading">
          {showAll ? "ALL PRODUCTS" : "BY APPLICATION"}
        </SectionHeading>

        <button
          aria-pressed={showAll}
          className={`${TOGGLE} ${showAll ? TOGGLE_STATE.on : TOGGLE_STATE.off} self-start sm:self-auto`}
          onClick={() => setShowAll((current) => !current)}
          type="button"
        >
          {showAll ? "Browse by application" : "Show all products"}
          <span className="text-[0.9375rem] opacity-70">
            {showAll ? "" : `(${products.length})`}
          </span>
        </button>
      </div>

      <div className="mt-[2.25rem] lg:mt-[2.75rem]">
        {showAll ? (
          products.length ? (
            <div className={PRODUCT_GRID}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-[1.125rem] leading-[1.5rem] text-ice/70">
              The catalogue is being updated. Please check back shortly.
            </p>
          )
        ) : (
          <CategoryGrid counts={counts} />
        )}
      </div>
    </>
  );
}
