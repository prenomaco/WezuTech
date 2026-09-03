import { ProductMediaKind, ProductStatus, type Product } from "@prisma/client";
import { prisma } from "@/lib/db";
import { figmaAssets } from "@/lib/figma-assets";

export type CatalogProduct = Pick<Product, "id" | "slug" | "name" | "tagline" | "cardDescription" | "introduction" | "seoTitle" | "seoDescription"> & { imageUrl: string };

/**
 * The product the design shows (Figma nodes 252:484 and 252:482), used until
 * the CMS has published entries. Copy is taken verbatim from the frame so the
 * page matches the design out of the box.
 */
const showcaseProduct: CatalogProduct = {
  id: "showcase-ev-cooling",
  slug: "electric-vehicle-cooling-systems",
  name: "Electric Vehicle Cooling Systems",
  tagline: "Thermal management for batteries, motors and power electronics.",
  cardDescription:
    "Wezu Technologies develops advanced thermal management systems for EV batteries, motors, and power electronics, designed to maintain optimal operating temperatures and improve overall vehicle efficiency. Its solutions include battery, motor, and inverter cooling, integrated cooling channels, active and passive thermal management, heat exchangers, and real-time monitoring and control.\n\nThese technologies help extend battery life, enhance performance and safety, maximize driving range, and enable scalable cooling solutions for next-generation electric vehicles.",
  introduction:
    "Wezu Technologies develops advanced thermal management systems for EV batteries, motors, and power electronics, designed to maintain optimal operating temperatures and improve overall vehicle efficiency. Its solutions include battery, motor, and inverter cooling, integrated cooling channels, active and passive thermal management, heat exchangers, and real-time monitoring and control.",
  seoTitle: "Electric Vehicle Cooling Systems | Wezu Technologies",
  seoDescription:
    "Battery, motor and inverter cooling, integrated cooling channels, heat exchangers and real-time monitoring from Wezu Technologies.",
  imageUrl: figmaAssets.productIllustration,
};

export async function getPublishedProducts(): Promise<CatalogProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { media: { where: { kind: ProductMediaKind.CARD }, orderBy: { sortOrder: "asc" }, take: 1 } },
    });
    if (!products.length) return [showcaseProduct];
    return products.map(({ media, ...product }) => ({ ...product, imageUrl: media[0]?.url ?? figmaAssets.productIllustration }));
  } catch {
    return [showcaseProduct];
  }
}
