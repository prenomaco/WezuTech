import type { Metadata } from "next";
import { AboutAtmosphere } from "@/components/atmosphere/about-atmosphere";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AboutIntro } from "@/components/sections/about-page";
import { Contact } from "@/components/sections/contact";
import { Testimonials } from "@/components/sections/testimonials";
import { jsonLd, webPageSchema } from "@/lib/structured-data";
import { SiteMotion } from "@/motion/site-motion";

const DESCRIPTION =
  "Wezu Technologies builds software, hardware and engineering solutions for the future of " +
  "transportation, logistics and mobility.";

export const metadata: Metadata = {
  title: "About",
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: { type: "website", url: "/about", title: "About Wezu Technologies", description: DESCRIPTION },
};

/**
 * Figma node 307:165 — a 1512 x 3151 frame.
 *
 * The header, testimonials, contact block and footer are the home page's, at
 * their own offsets here; the introduction, capabilities panel and process line
 * are this page's alone.
 */
export default function AboutPage() {
  return (
    <main className="relative">
      <SiteMotion />
      <AboutAtmosphere />
      <script
        dangerouslySetInnerHTML={jsonLd(
          webPageSchema({ path: "/about", name: "About Wezu Technologies", description: DESCRIPTION }),
        )}
        type="application/ld+json"
      />

      {/* The home page mounts its header inside the hero, which owns the plate
          and the frame it is placed against; this page has no hero, so it sits
          in a box of the header's own height. */}
      <div className="relative h-[6.625rem]">
        <Header />
      </div>

      <AboutIntro />

      {/* The shared sections carry the home page's rhythm, and this frame
          spaces them differently — the quote block sits 131px lower after the
          process line than it does after the industries grid. */}
      <div className="mt-[8.1875rem]">
        <Testimonials />
      </div>
      {/* Frame 307:165 puts the form 79.7px below the quote block and the
          footer panel 50.5px below the form, against the home frame's 51 and
          101; and it leaves 51.5px under the panel rather than 38. */}
      <Contact className="pt-[4.98125rem] pb-[3.15625rem]" />
      <div className="pb-[0.84375rem]">
        <Footer />
      </div>
    </main>
  );
}
