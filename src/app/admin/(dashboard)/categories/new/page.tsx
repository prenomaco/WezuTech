import { AdminCategoryForm } from "@/components/admin-category-form";
import { BackLink, PageHeader } from "@/components/dashboard/page-header";
import { getCategoriesForAdmin } from "@/lib/categories";

export const metadata = { title: "Add category" };
export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  /* So a new family lands at the end of the running order rather than on top
     of whatever currently sits at zero. */
  const existing = await getCategoriesForAdmin();
  const nextSortOrder = existing.length
    ? Math.max(...existing.map((category) => category.sortOrder)) + 1
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/categories">Categories</BackLink>
      <PageHeader
        description="Products are assigned to categories from the product form, once this exists."
        title="Add category"
      />
      <AdminCategoryForm nextSortOrder={nextSortOrder} />
    </div>
  );
}
