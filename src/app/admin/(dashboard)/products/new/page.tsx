import { AdminProductForm } from "@/components/admin-product-form";
import { BackLink, PageHeader } from "@/components/dashboard/page-header";

export const metadata = { title: "Add product" };
export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/products">Products</BackLink>
      <PageHeader
        description="Anything left blank falls back to the product page's own defaults. Only Name and Slug are required to save a draft."
        title="Add product"
      />
      <AdminProductForm />
    </div>
  );
}
