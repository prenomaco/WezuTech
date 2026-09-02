import { Section } from "@/components/layout/section";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { SectionHeading } from "@/components/ui/typography";

/**
 * Figma: "WHAT PEOPLE SAY" centred at y=2562, the quote stage beneath it at
 * y=2637 and the dot indicators at y=2950. The stage itself owns its frames,
 * arrows and dots — this shell only supplies the heading and the rhythm.
 */
export function Testimonials() {
  return (
    <Section className="pt-[4.5625rem] pb-[3.125rem]">
      <SectionHeading className="text-center" data-motion="testimonials-heading" variant="testimonials">
        WHAT PEOPLE SAY
      </SectionHeading>
      <TestimonialCarousel />
    </Section>
  );
}
