import { ProductMediaKind, ProductStatus, type Product } from "@prisma/client";
import { prisma } from "@/lib/db";
import { figmaAssets } from "@/lib/figma-assets";

export type CatalogProduct = Pick<Product, "id" | "slug" | "name" | "tagline" | "cardDescription" | "introduction" | "seoTitle" | "seoDescription"> & {
  imageUrl: string;
  /**
   * Every category this product is tagged against, name included.
   *
   * The name travels with the slug because the taxonomy is editable now: a
   * card that only knew slugs would have to look each one up against a
   * constant, which is exactly the coupling that moving categories into the
   * database removes.
   */
  categories: readonly { slug: string; name: string }[];
};

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
  categories: [{ slug: "thermal-management", name: "Thermal Management" }],
};

/**
 * Shared shape: the card image and the category tags every surface needs.
 *
 * Both the hero and the legacy card row are fetched, because the catalogue
 * card now shows the hero image. There used to be a separate "carousel card
 * image" upload, which meant every product had two pictures to keep in step
 * and the seeded kiosk shipped with a compressor drawing on its card and the
 * actual charger only on its page. One image, used everywhere, cannot drift.
 * `CARD` rows are still read so anything uploaded under the old field keeps
 * working until its product is next saved.
 */
const catalogSelection = {
  include: {
    media: {
      where: { kind: { in: [ProductMediaKind.HERO, ProductMediaKind.CARD] } },
      orderBy: { sortOrder: "asc" as const },
      select: { url: true, kind: true },
    },
    categories: {
      orderBy: { sortOrder: "asc" as const },
      select: { category: { select: { slug: true, name: true } } },
    },
  },
};

type CatalogRow = Product & {
  media: { url: string; kind: ProductMediaKind }[];
  categories: { category: { slug: string; name: string } }[];
};

function toCatalogProduct({ media, categories, ...product }: CatalogRow): CatalogProduct {
  const hero = media.find((item) => item.kind === ProductMediaKind.HERO);
  const legacyCard = media.find((item) => item.kind === ProductMediaKind.CARD);
  return {
    ...product,
    imageUrl: hero?.url ?? legacyCard?.url ?? figmaAssets.productIllustration,
    categories: categories.map((row) => row.category),
  };
}

export async function getPublishedProducts(): Promise<CatalogProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      ...catalogSelection,
    });
    if (!products.length) return [showcaseProduct];
    return products.map(toCatalogProduct);
  } catch {
    return [showcaseProduct];
  }
}

/** Published products tagged against one category, in catalogue order. */
export async function getProductsInCategory(slug: string): Promise<CatalogProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED, categories: { some: { category: { slug } } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      ...catalogSelection,
    });
    return products.map(toCatalogProduct);
  } catch {
    return [];
  }
}
