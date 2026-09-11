import { notFound } from "next/navigation";
import { AdminProductForm } from "@/components/admin-product-form";
import { BackLink, PageHeader } from "@/components/dashboard/page-header";
import { getProductCategories } from "@/lib/categories";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type EditProductPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, select: { name: true } });
  return { title: product ? `Edit ${product.name}` : "Product not found" };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        media: { orderBy: { sortOrder: "asc" } },
        sections: { orderBy: { sortOrder: "asc" } },
        categories: { select: { category: { select: { slug: true } } } },
      },
    }),
    getProductCategories(),
  ]);
  if (!product) notFound();

  const { media, sections, ...rest } = product;

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/products">Products</BackLink>
      <PageHeader description={`/products/${product.slug}`} title={product.name} />
      <AdminProductForm
        categoryOptions={categories}
        categorySlugs={product.categories.map((row) => row.category.slug)}
        media={media}
        product={rest}
        sections={sections}
      />
    </div>
  );
}
