import type { Testimonial } from "@prisma/client";
import { deleteTestimonial, saveTestimonial } from "@/app/admin/actions";
import { Button, Input, Label, Textarea } from "@/components/dashboard/ui";

export function AdminTestimonialForm({ testimonial }: { readonly testimonial?: Testimonial }) {
  return (
    <details className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)]" open={!testimonial}>
      <summary className="cursor-pointer px-5 py-4 text-sm font-semibold marker:text-[var(--dash-muted)]">
        {testimonial ? `Edit ${testimonial.client}` : "Add testimonial"}
      </summary>
      <form action={saveTestimonial} className="grid gap-4 border-t border-[var(--dash-border)] p-5 sm:grid-cols-2">
        <input name="id" type="hidden" value={testimonial?.id ?? ""} />
        <label className="flex flex-col gap-1.5 sm:col-span-2"><Label>Lead text</Label><Input defaultValue={testimonial?.lead ?? ""} name="lead" placeholder="Optional bold opening" /></label>
        <label className="flex flex-col gap-1.5 sm:col-span-2"><Label>Quote</Label><Textarea defaultValue={testimonial?.quote ?? ""} name="quote" required rows={5} /></label>
        <label className="flex flex-col gap-1.5"><Label>Client</Label><Input defaultValue={testimonial?.client ?? ""} name="client" required /></label>
        <label className="flex flex-col gap-1.5"><Label>Title</Label><Input defaultValue={testimonial?.title ?? ""} name="title" required /></label>
        <label className="flex flex-col gap-1.5"><Label>Display order</Label><Input defaultValue={testimonial?.sortOrder ?? 0} min={0} name="sortOrder" type="number" /></label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm"><input defaultChecked={testimonial?.isPublished ?? true} name="isPublished" type="checkbox" /> Published</label>
        <div className="flex gap-3 sm:col-span-2"><Button type="submit">Save testimonial</Button></div>
      </form>
      {testimonial ? (
        <form action={deleteTestimonial} className="border-t border-[var(--dash-border)] px-5 py-3">
          <input name="id" type="hidden" value={testimonial.id} />
          <Button type="submit" variant="destructive">Delete testimonial</Button>
        </form>
      ) : null}
    </details>
  );
}
