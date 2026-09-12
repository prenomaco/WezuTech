import { PlusIcon } from "@phosphor-icons/react/ssr";
import { CategoriesTable, type CategoryRow } from "@/components/dashboard/categories-table";
import { PageHeader, PrimaryActionLink } from "@/components/dashboard/page-header";
import { getCategoriesForAdmin } from "@/lib/categories";

export const metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategoriesForAdmin();

  const rows: CategoryRow[] = categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    blurb: category.blurb,
    image: category.image,
    icon: category.icon,
    sortOrder: category.sortOrder,
    productCount: category._count.products,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        action={
          <PrimaryActionLink href="/admin/categories/new">
            <PlusIcon aria-hidden className="size-4" /> Add category
          </PrimaryActionLink>
        }
        description="The product families the catalogue is filed under. Each one gets its own page, and products can belong to several."
        title="Categories"
      />

      <CategoriesTable categories={rows} />
    </div>
  );
}
