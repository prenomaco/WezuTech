/* Category artwork is admin-uploaded to Cloudinary, and no remote pattern is
   configured for next/image — so it stays a plain <img>, as product renders
   do. */
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { categoryPath, type ProductCategorySummary } from "@/lib/categories";

/**
 * The product families, as cards on `/products`.
 *
 * A card rather than the home page's icon-and-copy row. The industries
 * section is a fixed composition measured against a Figma frame; this is an
 * index whose contents are managed in the dashboard, so it has to hold six
 * categories or nine without being redrawn, and it has to look deliberate
 * whether or not a category has artwork yet.
 *
 * Which is what the icon is for. Most families will not have a render for a
 * while, and some — Thermal Management, Diagnostics — have no single obvious
 * picture at all, so every category carries an icon and the card falls back
 * to it inside a lit panel built from the site's own tokens. Uploading art in
 * the dashboard replaces the panel with the image and needs no code change.
 */
const CARD =
  "lift group flex h-full flex-col gap-4 rounded-xl border border-[rgb(218_250_245/0.12)] " +
  "bg-ink-raised/60 p-5 transition-[border-color,background-color] duration-300 ease-out " +
  "hover:border-[rgb(35_164_236/0.45)] hover:bg-ink-raised lg:p-6";

/**
 * The icon's panel: the design's own recessed ink with a lit top edge, the
 * same treatment the site gives its panels, so a category without a render
 * reads as designed rather than as a missing image.
 */
const ICON_PANEL =
  "relative grid size-[3.25rem] shrink-0 place-items-center overflow-hidden rounded-[0.75rem] " +
  "border border-[rgb(35_164_236/0.28)] bg-[linear-gradient(160deg,rgb(35_164_236/0.18),rgb(2_7_28/0.55))] " +
  "text-sky-bright transition-colors duration-300 ease-out group-hover:border-[rgb(35_164_236/0.55)]";

function CategoryMark({ category }: { readonly category: ProductCategorySummary }) {
  if (category.image) {
    return (
      <div className="grid size-[3.25rem] shrink-0 place-items-center overflow-hidden rounded-[0.75rem] border border-[rgb(218_250_245/0.12)] bg-[rgb(2_7_28/0.45)]">
        <img alt="" className="h-full w-full object-contain p-1" loading="lazy" src={category.image} />
      </div>
    );
  }

  return (
    <div className={ICON_PANEL}>
      <CategoryIcon className="size-6" icon={category.icon} />
    </div>
  );
}

function CategoryCard({ category }: { readonly category: ProductCategorySummary }) {
  return (
    <Link className={CARD} data-motion="industry-item" href={categoryPath(category.slug)}>
      <div className="flex items-start gap-4">
        <CategoryMark category={category} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[1.125rem] font-bold leading-[1.5rem] text-ice group-hover:text-frost">
            {category.name}
          </h3>
          <p className="mt-1 text-[0.875rem] leading-[1.125rem] text-sky-bright">
            {category.productCount} {category.productCount === 1 ? "product" : "products"}
          </p>
        </div>
      </div>

      <p className="text-[1rem] font-book leading-[1.3125rem] text-ice/80 lg:text-[1.0625rem] lg:leading-[1.4375rem]">
        {category.blurb}
      </p>

      <span className="mt-auto pt-1 text-[1rem] leading-[1.5rem] text-ice/70 transition-colors duration-200 group-hover:text-sky-bright">
        Browse
        <span
          aria-hidden
          className="ml-1.5 inline-block transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
        >
          →
        </span>
      </span>
    </Link>
  );
}

export function CategoryGrid({ categories }: { readonly categories: readonly ProductCategorySummary[] }) {
  if (!categories.length) {
    return (
      <p className="text-[1.125rem] leading-[1.5rem] text-ice/70">
        Categories are being set up. The full catalogue is available below.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {categories.map((category) => (
        <CategoryCard category={category} key={category.id} />
      ))}
    </div>
  );
}
