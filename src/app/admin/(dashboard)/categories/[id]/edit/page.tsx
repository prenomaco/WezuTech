import { notFound } from "next/navigation";
import { AdminCategoryForm } from "@/components/admin-category-form";
import { BackLink, PageHeader } from "@/components/dashboard/page-header";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type EditCategoryPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id }, select: { name: true } });
  return { title: category ? `Edit ${category.name}` : "Category not found" };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      blurb: true,
      image: true,
      imagePublicId: true,
      icon: true,
      sortOrder: true,
      _count: { select: { products: true } },
    },
  });
  if (!category) notFound();

  const { _count, ...values } = category;

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/categories">Categories</BackLink>
      <PageHeader
        description={`/products/category/${category.slug} · ${_count.products} ${_count.products === 1 ? "product" : "products"}`}
        title={category.name}
      />
      <AdminCategoryForm category={values} />
    </div>
  );
}
