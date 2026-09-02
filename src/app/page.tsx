import { Footer } from "@/components/layout/footer";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { Industries } from "@/components/sections/industries";
import { Products } from "@/components/sections/products";
import { Testimonials } from "@/components/sections/testimonials";
import { getPublishedProducts } from "@/lib/catalog";
import { siteUrl } from "@/lib/env";
import { SiteMotion } from "@/motion/site-motion";

export const dynamic = "force-dynamic";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Wezu Technologies",
  url: siteUrl,
  description: "Intelligent mobility hardware and software systems.",
};

export default async function Home() {
  const products = await getPublishedProducts();

  return (
    <main>
      <SiteMotion />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

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
