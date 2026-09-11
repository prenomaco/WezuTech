/* Product renders come from the CMS (Cloudinary) as well as the seeded local
   file, and no remote pattern is configured for next/image — so the card image
   stays a plain <img>, as it does in the home carousel. */
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ProductTitle } from "@/components/ui/typography";
import type { CatalogProduct } from "@/lib/catalog";
import { PRODUCT_CATEGORIES, categoryPath } from "@/lib/product-categories";

/**
 * A product in a grid, rather than in the home page's carousel.
 *
 * The carousel card is a wide two-track split measured against the Figma
 * frame; several of those stacked would read as a list of banners. This is the
 * same material — the render, the Centauri name, the card copy — in a portrait
 * cell that tiles, so a category holding three products looks like a
 * catalogue.
 *
 * The panel takes the page's own raised ink and the lit top edge the design
 * gives its panels, rather than a new surface treatment of its own.
 */
const CARD =
  "lift group relative flex h-full flex-col overflow-hidden rounded-xl " +
  "border border-[rgb(218_250_245/0.12)] bg-ink-raised/70 " +
  "transition-[border-color,background-color] duration-300 ease-out " +
  "hover:border-[rgb(35_164_236/0.45)] hover:bg-ink-raised";

/** The first paragraph only: the grid cell is not the product page. */
function summarise(product: CatalogProduct) {
  const source = product.tagline ?? product.cardDescription ?? product.introduction ?? "";
  return source.split(/\n\s*\n/)[0] ?? "";
}

function categoryTitle(slug: string) {
  return PRODUCT_CATEGORIES.find((category) => category.slug === slug)?.title ?? slug;
}

export function ProductCard({ product }: { readonly product: CatalogProduct }) {
  return (
    <article className={CARD} data-motion="industry-item">
      <Link
        aria-label={product.name}
        className="flex flex-1 flex-col"
        href={`/products/${product.slug}`}
      >
        {/* A fixed ratio so a row of cards keeps one baseline whatever shape
            the uploaded render happens to be, and `contain` rather than
            `cover` so a render is never cropped — the catalogue photos are
            around 3:2 and the seeded technical drawings are square, so the box
            takes the photos' ratio and the drawings letterbox inside it. */}
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-[rgb(2_7_28/0.45)]">
          <img
            alt={product.name}
            className="h-full w-full object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            loading="lazy"
            src={product.imageUrl}
          />
        </div>

        <div className="flex flex-1 flex-col gap-[0.625rem] p-5 lg:p-6">
          <ProductTitle size="card">{product.name}</ProductTitle>
          <p className="text-[1rem] font-book leading-[1.3125rem] text-ice/80">
            {summarise(product)}
          </p>
          <span className="mt-auto pt-2 text-[1rem] leading-[1.5rem] text-sky-bright">
            Learn more
            <span aria-hidden className="ml-1.5 inline-block transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none">
              →
            </span>
          </span>
        </div>
      </Link>

      {/* Outside the card link: nesting an anchor inside an anchor is invalid
          and the browser drops one of them. */}
      {product.categorySlugs.length ? (
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-5 pb-5 lg:px-6 lg:pb-6">
          {product.categorySlugs.map((slug) => (
            <Link
              className="text-[0.875rem] leading-[1.125rem] text-ice/55 underline-offset-4 transition-colors duration-200 hover:text-ice hover:underline"
              href={categoryPath(slug)}
              key={slug}
            >
              {categoryTitle(slug)}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}

/** The tiling every product grid uses, so the index and a category page agree. */
export const PRODUCT_GRID =
  "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6";
