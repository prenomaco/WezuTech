import Image from "next/image";
import { Section } from "@/components/layout/section";
import { Prose, SectionHeading } from "@/components/ui/typography";
import { about } from "@/content/site-content";

const ARTWORK = {
  src: "/figma/4ee4965ee44dd5484773156ad47d1b9d4690459e.png",
  width: 1264,
  height: 843,
};

/**
 * Figma node 252:478 places the artwork at x=766 with a width of 840 — it runs
 * 94px past the 1512 frame. That bleed is intentional, so the image is
 * positioned against the section and clipped by it rather than being squeezed
 * into the text column.
 */
function AboutArtwork() {
  return (
    <Image
      alt="Connected mobility platforms around a control module"
      className="absolute left-[50.6614%] top-[-4rem] w-[55.5556%] max-w-none object-contain"
      data-motion="about-artwork"
      height={ARTWORK.height}
      sizes="(min-width: 1512px) 840px, 56vw"
      src={ARTWORK.src}
      width={ARTWORK.width}
    />
  );
}

/**
 * Section geometry (frame y=940 at the section top):
 * eyebrow y=1010 (70px in), copy y=1062, artwork y=876, section ends y=1440.
 * The two paragraphs are separated by a blank line in the design, so the gap
 * equals one 24px line box rather than an arbitrary margin.
 */
export function About() {
  return (
    <Section id="about" className="min-h-[31.25rem] pt-[4.375rem]" bleed={<AboutArtwork />}>
      <SectionHeading data-motion="about-eyebrow" variant="about">{about.eyebrow}</SectionHeading>

      <div className="mt-[1.625rem] flex w-[45.0920%] flex-col gap-[1.5rem]" data-motion="about-copy">
        {about.paragraphs.map((paragraph) => (
          <Prose key={paragraph.slice(0, 32)}>{paragraph}</Prose>
        ))}
      </div>
    </Section>
  );
}
