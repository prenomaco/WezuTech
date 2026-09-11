import { Plus } from "lucide-react";
import { PageHeader, PrimaryActionLink } from "@/components/dashboard/page-header";
import { ProductsTable, type ProductRow } from "@/components/dashboard/products-table";
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
  const products = await prisma.product.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      sortOrder: true,
      _count: { select: { leads: true } },
      categories: { select: { category: { select: { slug: true } } } },
    },
  });

  const rows: ProductRow[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    status: product.status,
    sortOrder: product.sortOrder,
    leadCount: product._count.leads,
    categorySlugs: product.categories.map((row) => row.category.slug),
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        action={
          <PrimaryActionLink href="/admin/products/new">
            <Plus aria-hidden className="size-4" /> Add product
          </PrimaryActionLink>
        }
        description="The catalogue behind the home page carousel, the products index and every category page."
        title="Products"
      />

      <ProductsTable products={rows} />
    </div>
  );
}
