import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Section } from "@/components/layout/section";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPageShell } from "@/components/product/product-page-shell";
import { SpecificationsTable } from "@/components/product/specifications-table";
import { Contact } from "@/components/sections/contact";
import { ButtonLink } from "@/components/ui/button";
import type { CatalogProduct } from "@/lib/catalog";
import { Glyph } from "@/components/glyph";
import type { ProductDetail, ProductFeatureItem } from "@/lib/product-detail";

const OTHER_PRODUCTS_LIMIT = 3;

/* Dynamic CMS and Cloudinary media intentionally use native images. */
/* eslint-disable @next/next/no-img-element */

const FALLBACK_APPLICATION_IMAGES = [
  "/figma/f244f86516f41aac4f54fdef2c7943b8e6413c4d.png",
  "/figma/964e4d39b3740c17a805897874e5c3497bf679f5.png",
  "/figma/ee3aa089783daeb934cee841a5dca039bc96811f.png",
] as const;

/*
 * The feature marks come from each feature's own icon key.
 *
 * They used to come from a list of six exported SVGs indexed by position, so
 * every product in the catalogue showed the same six marks in the same order
 * and a feature's icon had nothing to do with what the feature was: "Liquid
 * Cooling" wore whichever glyph happened to be sixth. The key is chosen
 * beside the feature in the dashboard now, and an unset one falls back to the
 * library's default rather than to a coincidence.
 */
function FeatureRow({ items }: { readonly items: readonly ProductFeatureItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
      {items.slice(0, 6).map((item, index) => (
        <article data-motion="product-feature-item" key={`${item.title}-${index}`}>
          <Glyph className="size-9 text-sky-bright" icon={item.icon} />
          <h3 className="mt-5 font-bold leading-[1.4] text-white">{item.title}</h3>
          <p className="mt-2 font-book leading-[1.4] text-white">{item.body}</p>
        </article>
      ))}
    </div>
  );
}

function ApplicationCards({ product }: { readonly product: ProductDetail }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {product.applications.items.slice(0, 3).map((item, index) => {
        const media = product.media.applications[index];
        return (
          <article className="group" data-motion="products-card" key={`${item.title}-${index}`}>
            <div className="relative h-40 overflow-hidden rounded-2xl border border-[rgb(128_178_204/0.25)]">
              <img
                alt={media?.alt || item.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] motion-reduce:transform-none motion-reduce:transition-none"
                src={media?.url || FALLBACK_APPLICATION_IMAGES[index]}
              />
              {/* A soft tint rather than the zoom alone, so the edge of the
                  frame reads as a graded fade instead of the enlarged image
                  cutting hard against the rounded corner. */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 motion-reduce:transition-none" />
            </div>
            <h3 className="mt-4 text-xl font-bold leading-[1.4] text-white">{item.title}</h3>
            <p className="mt-2 font-book leading-[1.4] text-white">{item.body}</p>
          </article>
        );
      })}
    </div>
  );
}

function OtherProducts({ products }: { readonly products: readonly CatalogProduct[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {products.slice(0, OTHER_PRODUCTS_LIMIT).map((item) => (
        <article className="group flex flex-col" data-motion="products-card" key={item.id}>
          <div className="relative h-40 overflow-hidden rounded-2xl border border-[rgb(128_178_204/0.25)]">
            <img
              alt={item.name}
              className="h-full w-full object-contain transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] motion-reduce:transform-none motion-reduce:transition-none"
              src={item.imageUrl}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 motion-reduce:transition-none" />
          </div>
          <h3 className="mt-4 text-xl font-bold leading-[1.4] text-white">{item.name}</h3>
          {item.tagline ? <p className="mt-2 font-book leading-[1.4] text-white">{item.tagline}</p> : null}
          <ButtonLink className="mt-5 self-start" href={`/products/${item.slug}`} variant="ghost">
            Learn More
          </ButtonLink>
        </article>
      ))}
    </div>
  );
}

export function ProductDetailPage({
  otherProducts = [],
  product,
}: {
  readonly otherProducts?: readonly CatalogProduct[];
  readonly product: ProductDetail;
}) {
  return (
    <ProductPageShell>
      <div className="relative h-[6.625rem]"><Header /></div>

      <Section className="pt-[3.375rem] pb-[3.75rem] lg:pt-[3.375rem] lg:pb-[4.75rem]">
        <div className="grid items-start gap-10 lg:grid-cols-[40.875rem_minmax(0,1fr)] lg:gap-[3rem]">
          <div className="order-2 lg:order-none lg:ml-[2.5625rem] lg:pt-[1.875rem]">
            <h1 className="font-display text-[1.4375rem] leading-tight text-white" data-motion="product-title">{product.name}</h1>
            <div className="mt-9 max-w-[34.7rem] text-[1.172875rem] leading-[1.38] text-white">
              {product.tagline ? (
                <strong className="block font-bold" data-motion="product-copy">
                  {product.tagline}
                </strong>
              ) : null}
              {product.introduction ? (
                <p className="font-book" data-motion="product-copy">
                  {product.introduction}
                </p>
              ) : null}
            </div>

            {product.metrics.length ? (
              <div className="mt-10 grid items-stretch gap-2 sm:grid-cols-3">
                {product.metrics.slice(0, 3).map((metric) => (
                  <div
                    className="flex min-h-[6.125rem] flex-col justify-center rounded-[0.625rem] bg-black/20 px-[1.375rem] py-3 text-white"
                    data-motion="product-metric"
                    key={metric.label}
                  >
                    <strong className="block text-[1.798rem] leading-[1.115]">{metric.value}</strong>
                    <span className="mt-1 font-book text-[1.172875rem] leading-[1.115]">{metric.label}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-[2.125rem] flex flex-wrap gap-2">
              <ButtonLink data-motion="product-cta" href="#product-contact">{product.cta.quoteLabel}</ButtonLink>
              {product.media.datasheet ? (
                <ButtonLink data-motion="product-cta" href={product.media.datasheet} rel="noreferrer" target="_blank" variant="ghost">
                  {product.cta.datasheetLabel}
                </ButtonLink>
              ) : null}
            </div>
          </div>

          <div data-motion="product-gallery">
            <ProductGallery gallery={product.media.gallery} hero={product.media.hero} name={product.name} />
          </div>
        </div>
      </Section>

      {product.overview.title || product.overview.intro || product.overview.items.length ? (
        <Section className="pt-[0.75rem] pb-[5.5rem] lg:pt-0 lg:pb-[6.75rem]">
          {/* Figma anchors the detail image at frame-x=88 and the panel at
              frame-x=481 (raw node metadata, not the calc(50%-…) the codegen
              emits relative to a narrower ancestor) — a ~14px gap, not the
              overlap it looks like at a glance. A two-track grid can't place
              the image 16px into the container's own left gutter, so it's
              positioned on top of a panel that simply fills the remaining
              width. */}
          <div className="relative lg:min-h-[25.5rem]">
            {product.media.detail ? (
              <div className="relative z-20 mb-8 lg:absolute lg:left-[-1rem] lg:top-1/2 lg:mb-0 lg:w-[23.6913rem] lg:-translate-y-1/2" data-motion="product-detail-image">
                <img alt={`${product.name} detail view`} className="mx-auto h-[25rem] w-full object-contain" src={product.media.detail} />
              </div>
            ) : null}
            <div className="product-notched-panel p-8 text-white lg:ml-[23.5625rem] lg:min-h-[25.5rem] lg:px-[5.625rem] lg:pt-[2.25rem] lg:pb-[2.25rem]" data-motion="product-panel">
              {product.overview.title ? <h2 className="font-display text-[1.172875rem] leading-[1.35]">{product.overview.title}</h2> : null}
              {product.overview.intro ? <p className="mt-3 font-book leading-[1.4]">{product.overview.intro}</p> : null}
              <div className="mt-5 space-y-5">
                {product.overview.items.map((item) => (
                  <div key={item.title}>
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="font-book leading-[1.4]">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      ) : null}

      {product.features.items.length ? (
        <Section className="pb-[5.75rem]">
          <h2 className="mb-[3.125rem] text-center font-display text-[1.172875rem] text-white" data-motion="product-section-heading">{product.features.title}</h2>
          <FeatureRow items={product.features.items} />
        </Section>
      ) : null}

      {product.applications.items.length ? (
        <Section className="pb-[5.5rem]">
          <h2 className="mb-[2.875rem] text-center font-display text-[1.172875rem] text-white" data-motion="product-section-heading">{product.applications.title}</h2>
          <ApplicationCards product={product} />
        </Section>
      ) : null}

      {product.specifications.items.length ? (
        <Section className="pb-[3.75rem] lg:pb-[4.5rem]">
          <div className="mx-auto max-w-[54.09375rem] text-white">
            <h2 className="text-center font-display text-[1.172875rem]" data-motion="product-section-heading">{product.specifications.title}</h2>
            {product.specifications.note ? <p className="mt-1 text-center font-book text-[#999]">{product.specifications.note}</p> : null}
            <SpecificationsTable items={product.specifications.items} />
          </div>
        </Section>
      ) : null}

      {otherProducts.length ? (
        <Section className="pb-[5.5rem]">
          <h2 className="mb-[2.875rem] text-center font-display text-[1.172875rem] text-white" data-motion="product-section-heading">
            Our Other Products
          </h2>
          <OtherProducts products={otherProducts} />
        </Section>
      ) : null}

      <div className="relative" id="product-contact">
        <Contact
          className="pt-[3.75rem] pb-[3.75rem] lg:pt-[3.5rem] lg:pb-[4.75rem]"
          productName={product.name}
          productSlug={product.slug}
        />
      </div>
      <Footer />
    </ProductPageShell>
  );
}
