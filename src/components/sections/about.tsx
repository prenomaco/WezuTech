import { Section } from "@/components/layout/section";
import { EcosystemVideo } from "@/components/media/ecosystem-video";
import { Prose, SectionHeading } from "@/components/ui/typography";
import { about } from "@/content/site-content";

/**
 * Figma node 252:478 places the artwork in an 840 x 560 box at x=766, running
 * 94px past the 1512 frame. That bleed is deliberate, so the image is clipped
 * by the section rather than squeezed into the text column.
 *
 * The supplied 16:9 motion asset is cropped inside the original 746 x 560
 * artwork ratio. Its background is the same ink token as the page, so the
 * crop preserves the design's placement without exposing a rectangular edge.
 */
function AboutArtwork() {
  return (
    <EcosystemVideo
      className="absolute top-[-4rem] left-[50.1984%] aspect-[746/560] w-[49.3386%] max-w-none"
      variant="desktop"
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
      <EcosystemVideo
        className="mx-auto mt-[4.375rem] aspect-[1264/843] w-[calc(100%-0.0625rem)] max-w-[37.5rem]"
        variant="mobile"
      />

      {/* The measure is capped as the column widens. At a tablet width the
          81% column runs to a ~670px line, which is roughly twice a
          comfortable reading measure. */}
      <div className="mx-auto w-[81.3433%] sm:max-w-[34rem]">
        <SectionHeading
          className="mt-[3.7292rem] text-center"
          data-motion="about-eyebrow"
          variant="about"
        >
          {about.eyebrow}
        </SectionHeading>

        <div
          className="mt-[1.9375rem] flex flex-col gap-[2.625rem] text-center"
          data-motion="about-copy"
        >
          {about.paragraphs.map((paragraph) => (
            <Prose key={paragraph.slice(0, 32)}>{paragraph}</Prose>
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
        <SectionHeading data-motion="about-eyebrow" variant="about">
          {about.eyebrow}
        </SectionHeading>

        <div
          className="mt-[1.625rem] flex w-[45.0920%] flex-col gap-[1.5rem]"
          data-motion="about-copy"
        >
          {about.paragraphs.map((paragraph) => (
            <Prose key={paragraph.slice(0, 32)}>{paragraph}</Prose>
          ))}
        </div>
      </Section>
    </div>
  );
}
