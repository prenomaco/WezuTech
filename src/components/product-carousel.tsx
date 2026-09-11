"use client";
/* Product renders come from the CMS (Cloudinary) as well as the seeded local
   file, and no remote pattern is configured for next/image — so the card image
   stays a plain <img>. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "@/components/analytics";
import { ButtonLink } from "@/components/ui/button";
import { CarouselArrow } from "@/components/ui/carousel-arrow";
import { ProductTitle, Prose } from "@/components/ui/typography";
import type { CatalogProduct } from "@/lib/catalog";
import { PRODUCT_INTEREST_EVENT, type ProductInterestDetail } from "@/lib/product-interest";

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
    <article
      className={`relative w-full shrink-0 snap-start ${CARD_GRID}`}
      data-motion="products-card"
    >
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
        {/* The 402 frame sets the body flush under the title. With the wider
            type of a tablet the two lines of the title close right up on it,
            so the copy takes a line's worth of air there. */}
        <div className="-mt-[0.1875rem] flex w-[21.25rem] max-w-full flex-col gap-[1.3125rem] text-center sm:mt-[1.25rem] sm:w-[26rem] lg:mt-[1.1875rem] lg:w-auto lg:gap-[1.5565rem] lg:text-left">
          {(product.cardDescription ?? "").split(/\n\s*\n/).map((paragraph) => (
            <Prose key={paragraph.slice(0, 32)} size="product">
              {paragraph}
            </Prose>
          ))}
        </div>

        {/* Figma indents the CTA row 3px from the copy column (685 -> 688). */}
        <div className="mt-[2.1875rem] flex w-[19.3125rem] flex-col items-center gap-[1.25rem] lg:mt-auto lg:ml-[3px] lg:w-auto lg:flex-row lg:gap-5">
          <ButtonLink
            className="w-full lg:w-[12.9375rem]"
            href="#contact"
            onClick={() => {
              trackEvent("product_contact_click", { product_slug: product.slug });
              window.dispatchEvent(
                new CustomEvent<ProductInterestDetail>(PRODUCT_INTEREST_EVENT, {
                  detail: { name: product.name },
                }),
              );
            }}
          >
            Contact For Purchase
          </ButtonLink>
          <ButtonLink
            className="w-full lg:w-[12.9375rem]"
            href={`/products/${product.slug}`}
            onClick={() => trackEvent("product_detail_click", { product_slug: product.slug })}
            variant="ghost"
          >
            Learn More
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

/** How long each product holds before the rail advances, in milliseconds. */
const AUTOPLAY_MS = 5000;

export function ProductCarousel({ products }: { products: CatalogProduct[] }) {
  const rail = useRef<HTMLDivElement>(null);
  /*
   * Paused while the pointer is over the rail, and for the rest of the visit
   * once someone uses the arrows: a carousel that keeps moving under the
   * reader after they have taken control of it is fighting them.
   *
   * `surrendered` is state rather than a ref on purpose. As a ref it did stop
   * *future* runs of the effect, but the interval already scheduled kept
   * firing, so pressing an arrow appeared to do nothing about the autoplay and
   * the rail carried on advancing under the reader. State re-runs the effect,
   * which clears the interval in its cleanup.
   */
  const [paused, setPaused] = useState(false);
  const [surrendered, setSurrendered] = useState(false);

  /**
   * Scroll one card, wrapping at both ends.
   *
   * `scrollBy` alone stops dead at the rail's limits, so on the last product
   * the next arrow did nothing and on the first the previous arrow did nothing
   * either: two controls that look active and are not. Snapping to the
   * opposite end instead keeps both arrows meaningful at every position.
   */
  const move = useCallback((direction: number) => {
    const node = rail.current;
    if (!node) return;

    const page = node.clientWidth;
    const maxScroll = node.scrollWidth - page;
    /*
     * Half a card of tolerance, not a pixel.
     *
     * The rail is `snap-mandatory` and the card carries the frame's own left
     * inset, so its resting position at the first card is 18px rather than 0,
     * and a 1px test for "at the start" was never true: pressing Previous on
     * the first product fell through to `scrollBy`, which clamps, so the
     * control did nothing. Half a card is unambiguous, since a genuine
     * neighbouring position is a whole card away.
     */
    const tolerance = page / 2;
    const atStart = node.scrollLeft < tolerance;
    const atEnd = node.scrollLeft > maxScroll - tolerance;

    if (direction > 0 && atEnd) {
      node.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (direction < 0 && atStart) {
      /*
       * The exact maximum, not `scrollWidth`.
       *
       * Asking to scroll past the end is normally clamped, but this rail is
       * `snap-mandatory`, and an out-of-range target left the snap engine to
       * pick a snap point for itself: it chose the nearest one, which from the
       * start edge is the start, so the backward wrap went nowhere.
       */
      node.scrollTo({ left: maxScroll, behavior: "smooth" });
      return;
    }
    node.scrollBy({ left: direction * page, behavior: "smooth" });
  }, []);

  const step = useCallback(
    (direction: number) => {
      setSurrendered(true);
      move(direction);
    },
    [move],
  );

  useEffect(() => {
    if (products.length < 2) return;
    if (paused || surrendered) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      move(1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [move, paused, surrendered, products.length]);

  /* 402 frame: eyebrow 1615 -> card 1660, i.e. 24. The 1512 frame puts 32. */
  return (
    <div
      className="relative mt-6 lg:mt-8"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <CarouselArrow
        className={`hidden lg:flex ${ARROW_LEFT}`}
        direction="prev"
        label="Previous product"
        onClick={() => step(-1)}
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
        onClick={() => step(1)}
        scale="product"
      />
    </div>
  );
}
