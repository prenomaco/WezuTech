import { notFound } from "next/navigation";
import { AdminProductForm } from "@/components/admin-product-form";
import { BackLink, PageHeader } from "@/components/dashboard/page-header";
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
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      sections: { orderBy: { sortOrder: "asc" } },
      categories: { select: { category: { select: { slug: true } } } },
    },
  });
  if (!product) notFound();

  const { media, sections, categories, ...rest } = product;

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/products">Products</BackLink>
      <PageHeader description={`/products/${product.slug}`} title={product.name} />
      <AdminProductForm
        categorySlugs={categories.map((row) => row.category.slug)}
        media={media}
        product={rest}
        sections={sections}
      />
    </div>
  );
}
