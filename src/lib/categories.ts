import { ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Product categories, read from the database.
 *
 * These used to be a constant in `lib/product-categories.ts`, which made them
 * a deployment to change. They are the client's taxonomy — it grows with the
 * range — so they are rows now, edited in the dashboard, and every public
 * surface reads them from here.
 *
 * The home page's industries section is a different thing and still lives in
 * `content/site-content.ts`: those are the markets served, they are matched to
 * a Figma frame, and they are not what the catalogue is filed under.
 */
export interface ProductCategorySummary {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly blurb: string;
  readonly image: string | null;
  readonly icon: string;
  readonly sortOrder: number;
  /** Published products in this category. */
  readonly productCount: number;
}

/**
 * `/products/[slug]` already owns the product detail route, so category pages
 * cannot also be `/products/[category]` — the two would be the same segment.
 */
export function categoryPath(slug: string) {
  return `/products/category/${slug}`;
}

const publishedProducts = { where: { product: { status: ProductStatus.PUBLISHED } } } as const;

/**
 * Every category with its published product count, in display order.
 *
 * One query with a counted relation rather than a count per category, and the
 * count is of published products only: a draft should not inflate what a
 * visitor is told a category holds.
 */
export async function getProductCategories(): Promise<ProductCategorySummary[]> {
  try {
    const rows = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        blurb: true,
        image: true,
        icon: true,
        sortOrder: true,
        _count: { select: { products: publishedProducts } },
      },
    });
    return rows.map(({ _count, ...row }) => ({ ...row, productCount: _count.products }));
  } catch {
    /* The index still renders — just without the category half of it. */
    return [];
  }
}

export async function getProductCategory(slug: string): Promise<ProductCategorySummary | null> {
  try {
    const row = await prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        blurb: true,
        image: true,
        icon: true,
        sortOrder: true,
        _count: { select: { products: publishedProducts } },
      },
    });
    if (!row) return null;
    const { _count, ...category } = row;
    return { ...category, productCount: _count.products };
  } catch {
    return null;
  }
}

/** Slugs only — for `generateStaticParams` and for revalidating every page. */
export async function getCategorySlugs(): Promise<string[]> {
  try {
    const rows = await prisma.category.findMany({ select: { slug: true }, orderBy: { sortOrder: "asc" } });
    return rows.map((row) => row.slug);
  } catch {
    return [];
  }
}

/** The dashboard's list: no counts filtered by status, and drafts included. */
export async function getCategoriesForAdmin() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      blurb: true,
      image: true,
      imagePublicId: true,
      icon: true,
      sortOrder: true,
      _count: { select: { products: true } },
    },
  });
}
