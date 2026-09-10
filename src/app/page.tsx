import type { Metadata } from "next";
import { PageAtmosphere } from "@/components/atmosphere/page-atmosphere";
import { CurtainIntro } from "@/components/intro/curtain-intro";
import { Footer } from "@/components/layout/footer";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { Industries } from "@/components/sections/industries";
import { Products } from "@/components/sections/products";
import { Testimonials } from "@/components/sections/testimonials";
import { getPublishedProducts } from "@/lib/catalog";
import { jsonLd, organisationSchema, videoObjectSchema, webPageSchema, websiteSchema } from "@/lib/structured-data";
import { getPublishedTestimonials } from "@/lib/testimonials";
import { SiteMotion } from "@/motion/site-motion";

export const dynamic = "force-dynamic";

const DESCRIPTION =
  "Wezu Technologies builds intelligent hardware and software for vehicles and mobility platforms, " +
  "including thermal management, vehicle control, diagnostics and connected electronics.";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [products, testimonials] = await Promise.all([getPublishedProducts(), getPublishedTestimonials()]);

  return (
    <main className="relative">
      <SiteMotion />
      <PageAtmosphere />
      <CurtainIntro />
      <script dangerouslySetInnerHTML={jsonLd(organisationSchema())} type="application/ld+json" />
      <script dangerouslySetInnerHTML={jsonLd(websiteSchema())} type="application/ld+json" />
      <script
        dangerouslySetInnerHTML={jsonLd(
          webPageSchema({ path: "/", name: "Wezu Technologies", description: DESCRIPTION }),
        )}
        type="application/ld+json"
      />
      <script dangerouslySetInnerHTML={jsonLd(videoObjectSchema())} type="application/ld+json" />

      <Hero />
      <About />
      <Products products={products} />
      <Industries />
      <Testimonials testimonials={testimonials} />
      <Contact />
      <Footer />
    </main>
  );
}
