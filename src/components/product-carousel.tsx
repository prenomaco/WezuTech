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
/* The 402 frame stacks the same parts and centres them: image 258 wide at
   y=1660, title 275 at 1970, copy 340 at 2021, buttons from 2350. */
const CARD_GRID =
  "flex flex-col items-center " +
  /* `items-center` is a mobile-only choice — it survives into the grid and
     centres each track vertically instead of letting them fill the row, so the
     desktop layout has to put it back. */
  "lg:grid lg:h-[25.3125rem] lg:grid-cols-[23.5625rem_minmax(0,38.125rem)] lg:items-stretch " +
  "lg:gap-x-[4.125rem] lg:pl-[8.625rem]";

/* Glyph x=169 / right edge x=1362.4 in the 1512 frame, i.e. 65px from the
   1304 column's left edge and 45.6px from its right, less the button padding. */
const ARROW_LEFT = "left-[3.3125rem] top-1/2 -translate-y-1/2";
const ARROW_RIGHT = "right-[2.1rem] top-1/2 -translate-y-1/2";

function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <article className={`w-full shrink-0 snap-start ${CARD_GRID}`} data-motion="products-card">
      <img
        alt={product.name}
        className="h-[17.25rem] w-[16.125rem] object-contain lg:h-[25.125rem] lg:w-[23.5625rem]"
        src={product.imageUrl}
      />

      <div className="flex w-full flex-col items-center lg:items-stretch">
        <ProductTitle className="mt-[2.125rem] w-[17.1875rem] text-center lg:mt-0 lg:w-auto lg:max-w-[30.75rem] lg:text-left">
          {product.name}
        </ProductTitle>
        {/* The frame separates the description's paragraphs with a blank line
            (node 252:482), so a blank line in the copy becomes a paragraph. */}
        <div className="mt-[0.9375rem] flex w-[21.25rem] flex-col gap-[1.5565rem] text-center lg:mt-[1.1875rem] lg:w-auto lg:text-left">
          {(product.cardDescription ?? "").split(/\n\s*\n/).map((paragraph) => (
            <Prose key={paragraph.slice(0, 32)} size="product">
              {paragraph}
            </Prose>
          ))}
        </div>

        {/* Figma indents the CTA row 3px from the copy column (685 -> 688). */}
        <div className="mt-[5rem] flex w-[19.3125rem] flex-col items-center gap-[1.25rem] lg:mt-auto lg:ml-[3px] lg:w-auto lg:flex-row lg:gap-5">
          <ButtonLink
            className="w-full lg:w-[12.9375rem]"
            href="#contact"
            onClick={() => trackEvent("product_contact_click", { product_slug: product.slug })}
          >
            Contact For Purchase
          </ButtonLink>
          {/* Detail pages are not built yet, so this stays inert rather than
              becoming a link that goes nowhere. */}
          <span
            className="inline-flex h-11 w-full items-center justify-center rounded-control px-5 text-center text-base leading-none text-mist lg:w-[16.8125rem]"
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
        className={`hidden lg:flex ${ARROW_LEFT}`}
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
        className={`hidden lg:flex ${ARROW_RIGHT}`}
        direction="next"
        label="Next product"
        onClick={() => move(1)}
        scale="product"
      />
    </div>
  );
}
