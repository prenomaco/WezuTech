import Image from "next/image";
import { Section } from "@/components/layout/section";
import { Prose, SectionHeading } from "@/components/ui/typography";
import { about } from "@/content/site-content";

/* The transparent original rather than the flattened export, so the light
   behind it shows through instead of being covered by the crop's own ink. */
const ARTWORK = {
  src: "/figma/ecosystem.png",
  width: 746,
  height: 560,
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
 * The 402 frame reorders the section rather than narrowing it: the artwork
 * leads, full width and in flow (node 305:117 is 401 wide in a 402 frame),
 * and the eyebrow and copy centre beneath it. Gaps come from the frame's own
 * y-coordinates — artwork 795, eyebrow 1122, copy 1174.
 */
function MobileAbout() {
  return (
    <div className="overflow-clip lg:hidden">
      <Image
        alt="Connected mobility platforms around a control module"
        className="mt-[4.375rem] w-full object-contain"
        data-motion="about-artwork"
        height={ARTWORK.height}
        sizes="100vw"
        src={ARTWORK.src}
        width={ARTWORK.width}
      />

      <div className="mx-auto w-[81.3433%]">
        <SectionHeading className="mt-[3.7292rem] text-center" data-motion="about-eyebrow" variant="about">
          {about.eyebrow}
        </SectionHeading>

        <div className="mt-[1.9375rem] flex flex-col gap-[1.5rem] text-center" data-motion="about-copy">
          {about.paragraphs.map((paragraph) => (
            <Prose key={paragraph.slice(0, 32)}>
              {paragraph}
            </Prose>
          ))}
        </div>
      </div>
    </div>
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
    /* The anchor lives on the wrapper: the desktop shell below it is hidden on
       small screens, so an id on that alone would leave "About" pointing at
       nothing there. */
    <div id="about">
      <MobileAbout />

      <Section
        className="hidden min-h-[31.25rem] pt-[4.375rem] lg:block"
        bleed={<AboutArtwork />}
      >
        <SectionHeading data-motion="about-eyebrow" variant="about">{about.eyebrow}</SectionHeading>

        <div className="mt-[1.625rem] flex w-[45.0920%] flex-col gap-[1.5rem]" data-motion="about-copy">
          {about.paragraphs.map((paragraph) => (
            <Prose key={paragraph.slice(0, 32)}>{paragraph}</Prose>
          ))}
        </div>
      </Section>
    </div>
  );
}
