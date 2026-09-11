import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AboutAtmosphere } from "@/components/atmosphere/about-atmosphere";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Section } from "@/components/layout/section";
import { PRODUCT_GRID, ProductCard } from "@/components/products/product-card";
import { Contact } from "@/components/sections/contact";
import { DisplayTitle, Prose } from "@/components/ui/typography";
import { getProductsInCategory } from "@/lib/catalog";
import { PRODUCT_CATEGORIES, findProductCategory } from "@/lib/product-categories";
import { jsonLd, webPageSchema } from "@/lib/structured-data";
import { SiteMotion } from "@/motion/site-motion";

export const revalidate = 60;

/** Six known slugs, so every category page is prerendered at build. */
export function generateStaticParams() {
  return PRODUCT_CATEGORIES.map((category) => ({ category: category.slug }));
}

type CategoryPageProps = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = findProductCategory(slug);
  if (!category) return { title: "Category not found", robots: { index: false, follow: false } };

  const title = `${category.title} | Products`;
  return {
    title,
    description: category.body,
    alternates: { canonical: `/products/category/${category.slug}` },
    openGraph: {
      type: "website",
      url: `/products/category/${category.slug}`,
      title,
      description: category.body,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = findProductCategory(slug);
  if (!category) notFound();

  const products = await getProductsInCategory(category.slug);

  return (
    <main className="relative">
      <SiteMotion />
      <AboutAtmosphere />
      <script
        dangerouslySetInnerHTML={jsonLd(
          webPageSchema({
            path: `/products/category/${category.slug}`,
            name: `${category.title} | Products`,
            description: category.body,
          }),
        )}
        type="application/ld+json"
      />

      <div className="relative h-[6.625rem]">
        <Header />
      </div>

      <Section className="pt-[2.5rem] pb-[3.5rem] lg:pt-[3.375rem] lg:pb-[5rem]">
        <Link
          className="inline-flex items-center gap-2 text-[1rem] leading-[1.5rem] text-ice/70 transition-colors duration-200 hover:text-ice"
          href="/products"
        >
          <span aria-hidden>←</span> All products
        </Link>

        <DisplayTitle as="h1" className="mt-[1.25rem]" size="section" data-motion="hero-line">
          {category.title.toUpperCase()}
        </DisplayTitle>
        <Prose className="mt-[1.125rem] max-w-[44rem]" data-motion="hero-intro">
          {category.body}
        </Prose>

        <div className="mt-[3rem] lg:mt-[3.75rem]">
          {products.length ? (
            <div className={PRODUCT_GRID}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[rgb(218_250_245/0.12)] bg-ink-raised/60 p-8">
              <p className="text-[1.125rem] leading-[1.5rem] text-ice">
                Nothing listed for {category.title} yet.
              </p>
              <p className="mt-2 text-[1rem] font-book leading-[1.3125rem] text-ice/70">
                We build to requirement across every application area — tell us what you need and
                we will come back with options.
              </p>
              <Link
                className="mt-4 inline-block text-[1rem] leading-[1.5rem] text-sky-bright hover:underline"
                href="/products"
              >
                Browse the full catalogue →
              </Link>
            </div>
          )}
        </div>
      </Section>

      <Contact className="pt-[2rem] pb-[3.15625rem]" />
      <div className="pb-[0.84375rem]">
        <Footer />
      </div>
    </main>
  );
}
