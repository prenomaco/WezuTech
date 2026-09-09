import { AdminTestimonialForm } from "@/components/admin-testimonial-form";
import { prisma } from "@/lib/db";

export const metadata = { title: "Testimonials" };
export const dynamic = "force-dynamic";

export default async function TestimonialsAdminPage() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return (
    <div className="flex flex-col gap-6">
      <div><h2 className="font-display text-xl text-[var(--dash-fg)]">Testimonials</h2><p className="text-sm text-[var(--dash-muted)]">Manage the quotes shared by the Home and About page carousel.</p></div>
      <section className="flex flex-col gap-4">
        <AdminTestimonialForm />
        {testimonials.map((testimonial) => <AdminTestimonialForm key={testimonial.id} testimonial={testimonial} />)}
      </section>
    </div>
  );
}
