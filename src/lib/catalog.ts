import { ProductMediaKind, ProductStatus, type Product } from "@prisma/client";
import { prisma } from "@/lib/db";
import { figmaAssets } from "@/lib/figma-assets";

export type CatalogProduct = Pick<Product, "id" | "slug" | "name" | "tagline" | "cardDescription" | "introduction" | "seoTitle" | "seoDescription"> & { imageUrl: string };

const showcaseProduct: CatalogProduct = {
  id: "showcase-public-kiosk",
  slug: "public-kiosk-charger",
  name: "Public Kiosk Charger",
  tagline: "Charge infrastructure, built for everywhere.",
  cardDescription: "Weather-sealed public AC/DC charging for connected, open-environment deployments.",
  introduction: "A weather-sealed public AC/DC charging kiosk designed for public spaces, parking areas, and workplace sites.",
  seoTitle: "Public Kiosk Charger | Wezu Technologies",
  seoDescription: "Connected, weather-sealed public charging infrastructure by Wezu Technologies.",
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
