import { ProductMediaKind } from "@prisma/client";
import { PlusIcon } from "@phosphor-icons/react/ssr";
import { PageHeader, PrimaryActionLink } from "@/components/dashboard/page-header";
import { ProductsTable, type ProductRow } from "@/components/dashboard/products-table";
import { getProductCategories } from "@/lib/categories";
import { prisma } from "@/lib/db";

export const metadata = { title: "Products" };
export const dynamic = "force-dynamic";

/**
 * The catalogue index.
 *
 * Selects only what the table draws. The previous version included every
 * product's media rows, every section row and a lead count, because it also
 * rendered a full edit form per product on the same page — several hundred
 * rows of JSON to paint a five-column table, and the single biggest reason
 * this route took twice as long to navigate to as any other.
 */
export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        sortOrder: true,
        _count: { select: { leads: true } },
        categories: {
          orderBy: { sortOrder: "asc" },
          select: { category: { select: { slug: true, name: true } } },
        },
        /* The hero, which is also what the catalogue card shows, and only
           its URL: enough for a 40px thumbnail without pulling every media
           row per product, which is what made this page the slowest in the
           rail. */
        media: {
          where: { kind: { in: [ProductMediaKind.HERO, ProductMediaKind.CARD] } },
          orderBy: { kind: "asc" },
          select: { url: true, kind: true },
        },
      },
    }),
    getProductCategories(),
  ]);

  const rows: ProductRow[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    status: product.status,
    sortOrder: product.sortOrder,
    leadCount: product._count.leads,
    categories: product.categories.map((row) => row.category),
    imageUrl:
      product.media.find((item) => item.kind === ProductMediaKind.HERO)?.url ??
      product.media.find((item) => item.kind === ProductMediaKind.CARD)?.url ??
      null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        action={
          <PrimaryActionLink href="/admin/products/new">
            <PlusIcon aria-hidden className="size-4" /> Add product
          </PrimaryActionLink>
        }
        description="The catalogue behind the home page carousel, the products index and every category page."
        title="Products"
      />

      <ProductsTable categories={categories} products={rows} />
    </div>
  );
}
