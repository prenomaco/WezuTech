import { PlusIcon } from "@phosphor-icons/react/ssr";
import { PageHeader, PrimaryActionLink } from "@/components/dashboard/page-header";
import { TestimonialsTable, type TestimonialRow } from "@/components/dashboard/testimonials-table";
import { prisma } from "@/lib/db";

export const metadata = { title: "Testimonials" };
export const dynamic = "force-dynamic";

export default async function TestimonialsAdminPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      client: true,
      title: true,
      quote: true,
      lead: true,
      isPublished: true,
      sortOrder: true,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        action={
          <PrimaryActionLink href="/admin/testimonials/new">
            <PlusIcon aria-hidden className="size-4" /> Add testimonial
          </PrimaryActionLink>
        }
        description="The quotes carried by the home page and About page carousels, in display order."
        title="Testimonials"
      />

      <TestimonialsTable testimonials={testimonials as TestimonialRow[]} />
    </div>
  );
}
