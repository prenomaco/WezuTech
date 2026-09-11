import { notFound } from "next/navigation";
import { AdminTestimonialForm } from "@/components/admin-testimonial-form";
import { BackLink, PageHeader } from "@/components/dashboard/page-header";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type EditTestimonialPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: EditTestimonialPageProps) {
  const { id } = await params;
  const testimonial = await prisma.testimonial.findUnique({ where: { id }, select: { client: true } });
  return { title: testimonial ? `Edit ${testimonial.client}` : "Testimonial not found" };
}

export default async function EditTestimonialPage({ params }: EditTestimonialPageProps) {
  const { id } = await params;
  const testimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonial) notFound();

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/testimonials">Testimonials</BackLink>
      <PageHeader description={testimonial.title} title={testimonial.client} />
      <AdminTestimonialForm testimonial={testimonial} />
    </div>
  );
}
