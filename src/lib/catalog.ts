import { ProductMediaKind, ProductStatus, type Product } from "@prisma/client";
import { prisma } from "@/lib/db";
import { figmaAssets } from "@/lib/figma-assets";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";

export type CatalogProduct = Pick<Product, "id" | "slug" | "name" | "tagline" | "cardDescription" | "introduction" | "seoTitle" | "seoDescription"> & {
  imageUrl: string;
  /** Slugs of every category this product is tagged against. */
  categorySlugs: readonly string[];
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
  categorySlugs: ["automotive"],
};

/** Shared shape: the card image and the category tags every surface needs. */
const catalogSelection = {
  include: {
    media: { where: { kind: ProductMediaKind.CARD }, orderBy: { sortOrder: "asc" }, take: 1 },
    categories: { select: { category: { select: { slug: true } } } },
  },
} as const;

type CatalogRow = Product & {
  media: { url: string }[];
  categories: { category: { slug: string } }[];
};

function toCatalogProduct({ media, categories, ...product }: CatalogRow): CatalogProduct {
  return {
    ...product,
    imageUrl: media[0]?.url ?? figmaAssets.productIllustration,
    categorySlugs: categories.map((row) => row.category.slug),
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

/**
 * How many published products sit in each category, keyed by slug.
 *
 * One grouped count rather than six queries, and every category appears even
 * when it holds nothing — the index has to be able to say "0 products" rather
 * than leave a cell looking broken.
 */
export async function getCategoryCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = Object.fromEntries(
    PRODUCT_CATEGORIES.map((category) => [category.slug, 0]),
  );
  try {
    const rows = await prisma.productCategory.findMany({
      where: { product: { status: ProductStatus.PUBLISHED } },
      select: { category: { select: { slug: true } } },
    });
    for (const row of rows) {
      counts[row.category.slug] = (counts[row.category.slug] ?? 0) + 1;
    }
  } catch {
    /* The index still renders, with every category reading zero. */
  }
  return counts;
}
