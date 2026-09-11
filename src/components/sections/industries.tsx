import { Section } from "@/components/layout/section";
import { CategoryGrid } from "@/components/products/category-grid";

/**
 * The home page's application-areas section.
 *
 * The cells themselves live in `products/category-grid` because `/products`
 * shows the same six, measured the same way — this is the section shell that
 * places them in the home page's vertical rhythm, and nothing more.
 */
export function Industries() {
  return (
    <Section id="gallery" className="pt-[5.0625rem] pb-[2.5rem] lg:pb-[4.5625rem]">
      <CategoryGrid />
    </Section>
  );
}
