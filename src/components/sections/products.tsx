import { Section } from "@/components/layout/section";
import { ProductCarousel } from "@/components/product-carousel";
import { SectionHeading } from "@/components/ui/typography";
import type { CatalogProduct } from "@/lib/catalog";

/**
 * Figma: "OUR PRODUCTS" centred at y=1467, the card between y=1525 and 1930,
 * and the chevrons pinned to the content column's edges. The card itself is a
 * scroll-snap rail so several published products share one frame.
 */
export function Products({ products }: { products: CatalogProduct[] }) {
  /* The 402 frame puts 111px between the end of the about copy and this
     eyebrow (1504 -> 1615); the 1512 frame puts 27. Below it the frame leaves
     108px before the industries (2458 -> 2566), where an 80px bottom pad on
     top of the industries' own 81px lead put 179 there and opened a hole under
     the product's second link. */
  return (
    <Section
      id="products"
      className="pt-[6.5625rem] pb-[1.6875rem] lg:pt-[1.6875rem] lg:pb-20"
    >
      <SectionHeading className="text-center" data-motion="products-heading">
        OUR PRODUCTS
      </SectionHeading>
      <ProductCarousel products={products} />
    </Section>
  );
}
