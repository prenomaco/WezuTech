import { AdminProductForm } from "@/components/admin-product-form";
import { Badge, Card, CardContent, CardHeader, CardTitle, Table, Td, Th } from "@/components/dashboard/ui";
import { prisma } from "@/lib/db";

export const metadata = { title: "Products" };
export const dynamic = "force-dynamic";

const STATUS_TONE = {
  PUBLISHED: "success",
  DRAFT: "warning",
  ARCHIVED: "neutral",
} as const;

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { media: { where: { kind: "CARD" }, take: 1 }, _count: { select: { leads: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl text-[var(--dash-fg)]">Products</h2>
        <p className="text-sm text-[var(--dash-muted)]">
          What the catalogue shows on the home page, in its running order.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catalogue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {products.length ? (
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Slug</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Enquiries</Th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <Td className="font-medium">{product.name}</Td>
                    <Td className="text-[var(--dash-muted)]">{product.slug}</Td>
                    <Td>
                      <Badge tone={STATUS_TONE[product.status]}>{product.status}</Badge>
                    </Td>
                    <Td className="text-right tabular-nums">{product._count.leads}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="p-5 text-sm text-[var(--dash-muted)]">Nothing published yet.</p>
          )}
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <AdminProductForm />
        {products.map((product) => (
          <AdminProductForm key={product.id} media={product.media[0]} product={product} />
        ))}
      </section>
    </div>
  );
}
