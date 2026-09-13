import { AdminProductForm } from "@/components/admin-product-form";
import { BackLink, PageHeader } from "@/components/dashboard/page-header";
import { getProductCategories } from "@/lib/categories";

export const metadata = { title: "Add product" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getProductCategories();

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/products">Products</BackLink>
      <PageHeader
        description="Fill the form in field by field, or switch to the JSON tab and paste a document an assistant wrote for you. Anything left blank falls back to the product page's own defaults; only Name and Slug are required to save a draft."
        title="Add product"
      />
      <AdminProductForm categoryOptions={categories} />
    </div>
  );
}
