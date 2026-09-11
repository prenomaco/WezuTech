import type { Metadata } from "next";
import { AboutAtmosphere } from "@/components/atmosphere/about-atmosphere";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Section } from "@/components/layout/section";
import { ProductIndex } from "@/components/products/product-index";
import { Contact } from "@/components/sections/contact";
import { DisplayTitle, Prose } from "@/components/ui/typography";
import { getPublishedProducts } from "@/lib/catalog";
import { getProductCategories } from "@/lib/categories";
import { jsonLd, webPageSchema } from "@/lib/structured-data";
import { SiteMotion } from "@/motion/site-motion";

const DESCRIPTION =
  "Charging, battery and energy storage hardware from Wezu Technologies, with the thermal " +
  "management, power electronics and diagnostics that go around it.";

export const metadata: Metadata = {
  title: "Products",
  description: DESCRIPTION,
  alternates: { canonical: "/products" },
  openGraph: { type: "website", url: "/products", title: "Products | Wezu Technologies", description: DESCRIPTION },
};

export const revalidate = 60;

/**
 * The catalogue index.
 *
 * Built on the About page's shell rather than the home page's: no hero, so the
 * header sits in a box of its own height, and the page borrows that page's
 * light field, contact block and footer so it reads as part of the same site
 * rather than a new template.
 *
 * The title is set in Centauri at the section scale — the same display face
 * the hero and every section heading use.
 */
export default async function ProductsIndexPage() {
  const [products, categories] = await Promise.all([getPublishedProducts(), getProductCategories()]);

  return (
    <main className="relative">
      <SiteMotion />
      <AboutAtmosphere />
      <script
        dangerouslySetInnerHTML={jsonLd(
          webPageSchema({ path: "/products", name: "Products | Wezu Technologies", description: DESCRIPTION }),
        )}
        type="application/ld+json"
      />

      <div className="relative h-[6.625rem]">
        <Header />
      </div>

      <Section className="pt-[2.5rem] pb-[3.5rem] lg:pt-[3.375rem] lg:pb-[5rem]">
        <DisplayTitle as="h1" size="section" data-motion="hero-line">
          PRODUCTS
        </DisplayTitle>
        <Prose className="mt-[1.125rem] max-w-[44rem]" data-motion="hero-intro">
          {DESCRIPTION}
        </Prose>

        <div className="mt-[3rem] lg:mt-[3.75rem]">
          <ProductIndex categories={categories} products={products} />
        </div>
      </Section>

      <Contact className="pt-[2rem] pb-[3.15625rem]" />
      <div className="pb-[0.84375rem]">
        <Footer />
      </div>
    </main>
  );
}
