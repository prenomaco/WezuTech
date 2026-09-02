"use client";
/* Product renders come from the CMS (Cloudinary) as well as the seeded local
   file, and no remote pattern is configured for next/image — so the card image
   stays a plain <img>. */
/* eslint-disable @next/next/no-img-element */

import { useRef } from "react";
import { trackEvent } from "@/components/analytics";
import { ButtonLink } from "@/components/ui/button";
import { CarouselArrow } from "@/components/ui/carousel-arrow";
import { ProductTitle, Prose } from "@/components/ui/typography";
import type { CatalogProduct } from "@/lib/catalog";

/**
 * Figma places the card inside the 1304px column as
 * `138px inset | 377px image | 66px gap | 610px copy`, 405px tall, with the
 * chevrons on the column edges and vertically centred on the card.
 */
const CARD_GRID = "grid h-[25.3125rem] grid-cols-[23.5625rem_minmax(0,38.125rem)] gap-x-[4.125rem] pl-[8.625rem]";

/* Glyph x=169 / right edge x=1362.4 in the 1512 frame, i.e. 65px from the
   1304 column's left edge and 45.6px from its right, less the button padding. */
const ARROW_LEFT = "left-[3.3125rem] top-1/2 -translate-y-1/2";
const ARROW_RIGHT = "right-[2.1rem] top-1/2 -translate-y-1/2";

function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <article className={`w-full shrink-0 snap-start ${CARD_GRID}`} data-motion="products-card">
      <img
        alt={product.name}
        className="h-[25.125rem] w-[23.5625rem] object-contain"
        src={product.imageUrl}
      />

      <div className="flex flex-col">
        <ProductTitle className="max-w-[30.75rem]">{product.name}</ProductTitle>
        <Prose className="mt-[1.1875rem]" size="product">{product.cardDescription}</Prose>

        {/* Figma indents the CTA row 3px from the copy column (685 -> 688). */}
        <div className="mt-auto ml-[3px] flex items-center gap-5">
          <ButtonLink
            className="w-[12.9375rem]"
            href="#contact"
            onClick={() => trackEvent("product_contact_click", { product_slug: product.slug })}
          >
            Contact For Purchase
          </ButtonLink>
          {/* Detail pages are not built yet, so this stays inert rather than
              becoming a link that goes nowhere. */}
          <span
            className="inline-flex h-11 w-[16.8125rem] items-center justify-center rounded-control px-5 text-base leading-none text-mist"
            title="Product detail page is in development"
          >
            Learn more about the product
          </span>
        </div>
      </div>
    </article>
  );
}

export function ProductCarousel({ products }: { products: CatalogProduct[] }) {
  const rail = useRef<HTMLDivElement>(null);

  const move = (direction: number) =>
    rail.current?.scrollBy({ left: direction * rail.current.clientWidth, behavior: "smooth" });

  return (
    <div className="relative mt-8">
      <CarouselArrow
        className={ARROW_LEFT}
        direction="prev"
        label="Previous product"
        onClick={() => move(-1)}
        scale="product"
      />

      <div
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={rail}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <CarouselArrow
        className={ARROW_RIGHT}
        direction="next"
        label="Next product"
        onClick={() => move(1)}
        scale="product"
      />
    </div>
  );
}
