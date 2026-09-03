import { Section } from "@/components/layout/section";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { SectionHeading } from "@/components/ui/typography";

/**
 * Figma: "WHAT PEOPLE SAY" centred at y=2562, the quote stage beneath it at
 * y=2637 and the dot indicators at y=2950. The stage itself owns its frames,
 * arrows and dots — this shell only supplies the heading and the rhythm.
 */
export function Testimonials() {
  /* 402 frame: 23 between the eyebrow and the block, and 54 from the dots to
     the next section, against the 1512 frame's 73 and 50. */
  return (
    <Section className="pt-[1.4375rem] pb-[1.25rem] lg:pt-[4.5625rem] lg:pb-[3.125rem]">
      <SectionHeading className="text-center" data-motion="testimonials-heading" variant="testimonials">
        WHAT PEOPLE SAY
      </SectionHeading>
      <TestimonialCarousel />
    </Section>
  );
}
