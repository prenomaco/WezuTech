import { PageAtmosphere } from "@/components/atmosphere/page-atmosphere";
import { Footer } from "@/components/layout/footer";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { Industries } from "@/components/sections/industries";
import { Products } from "@/components/sections/products";
import { Testimonials } from "@/components/sections/testimonials";
import { getPublishedProducts } from "@/lib/catalog";
import { jsonLd, organisationSchema, websiteSchema } from "@/lib/structured-data";
import { SiteMotion } from "@/motion/site-motion";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getPublishedProducts();

  return (
    <main className="relative">
      <SiteMotion />
      <PageAtmosphere />
      <script dangerouslySetInnerHTML={jsonLd(organisationSchema())} type="application/ld+json" />
      <script dangerouslySetInnerHTML={jsonLd(websiteSchema())} type="application/ld+json" />

      <Hero />
      <About />
      <Products products={products} />
      <Industries />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
