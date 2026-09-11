import { AdminTestimonialForm } from "@/components/admin-testimonial-form";
import { BackLink, PageHeader } from "@/components/dashboard/page-header";

export const metadata = { title: "Add testimonial" };
export const dynamic = "force-dynamic";

export default function NewTestimonialPage() {
  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/admin/testimonials">Testimonials</BackLink>
      <PageHeader
        description="Appears in the home and About page carousels once it is published."
        title="Add testimonial"
      />
      <AdminTestimonialForm />
    </div>
  );
}
