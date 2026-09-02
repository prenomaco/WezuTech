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
    <Section zone="testimonials" className="pt-[73px] pb-[50px]">
      <SectionHeading className="text-center" data-motion="testimonials-heading">
        WHAT PEOPLE SAY
      </SectionHeading>
      <TestimonialCarousel />
    </Section>
  );
}
