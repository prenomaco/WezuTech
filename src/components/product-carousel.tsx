"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef } from "react";
import type { CatalogProduct } from "@/lib/catalog";
import { trackEvent } from "@/components/analytics";

export function ProductCarousel({ products }: { products: CatalogProduct[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const move = (direction: number) => rail.current?.scrollBy({ left: direction * rail.current.clientWidth * 0.88, behavior: "smooth" });
  return <div className="product-wrap">
    <button className="carousel-arrow left" aria-label="Previous product" onClick={() => move(-1)}><img src="http://localhost:3845/assets/e4965fbbdf1923bdef14aa3762da1f9b42075235.svg" alt="" /></button>
    <div className="product-rail" ref={rail}>
      {products.map((product) => <article className="product-card" key={product.id}>
        {/* Figma assets are served directly by the Figma desktop asset host during design validation. */}
        <img src={product.imageUrl} alt={product.name} />
        <div className="product-copy"><h3>{product.name}</h3><p>{product.cardDescription}</p><div className="product-actions"><a className="button" href={`#contact`} onClick={() => trackEvent("product_contact_click", { product_slug: product.slug })}>Contact For Purchase</a><span className="future-link" title="Product detail page is in development">Learn more about the product</span></div></div>
      </article>)}
    </div>
    <button className="carousel-arrow right" aria-label="Next product" onClick={() => move(1)}><img src="http://localhost:3845/assets/e4298407a44c9c908675a40bf357ef952db5b5ed.svg" alt="" /></button>
  </div>;
}
