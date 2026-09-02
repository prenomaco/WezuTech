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
  return (
    <Section id="products" zone="products" className="pt-[27px] pb-20">
      <SectionHeading className="text-center" data-motion="products-heading">
        OUR PRODUCTS
      </SectionHeading>
      <ProductCarousel products={products} />
    </Section>
  );
}
