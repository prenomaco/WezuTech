"use client";

import Link from "next/link";
import type { Testimonial } from "@prisma/client";
import { useFormStatus } from "react-dom";
import { saveTestimonial } from "@/app/admin/actions";
import { Button, Input, Label, Textarea } from "@/components/dashboard/ui";

/**
 * One testimonial, on its own page.
 *
 * The quote is split in two on the live carousel: `lead` is set in bold and
 * runs straight into `quote`, which is how "Wezu Technologies has
 * consistently provided…" reads as one sentence with the company name
 * emphasised. The two fields sit next to each other here, with that spelled
 * out, because the split is not obvious from the field names alone.
 */
function Field({
  children,
  label,
  hint,
  wide,
}: {
  readonly children: React.ReactNode;
  readonly label: string;
  readonly hint?: string;
  readonly wide?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {hint ? <span className="-mt-1 text-xs text-[var(--dash-muted)]">{hint}</span> : null}
      {children}
    </label>
  );
}

function SaveBar({ isNew }: { readonly isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex items-center justify-end gap-3 border-t border-[var(--dash-border)] px-5 py-4">
      <Link
        className="inline-flex h-10 items-center rounded-lg border border-[var(--dash-border-strong)] px-4 text-sm font-medium text-[var(--dash-fg)] transition-colors hover:bg-[var(--dash-subtle)]"
        href="/admin/testimonials"
      >
        Cancel
      </Link>
      <Button className="h-10 px-5" disabled={pending} type="submit">
        {pending ? "Saving…" : isNew ? "Add testimonial" : "Save changes"}
      </Button>
    </div>
  );
}

export function AdminTestimonialForm({ testimonial }: { readonly testimonial?: Testimonial }) {
  const isNew = !testimonial;

  return (
    <form action={saveTestimonial} className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)]">
      <input name="id" type="hidden" value={testimonial?.id ?? ""} />

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <Field
          hint="Set in bold at the start of the quote, and runs straight into it. Usually the company name."
          label="Bold opening"
          wide
        >
          <Input defaultValue={testimonial?.lead ?? ""} name="lead" placeholder="Wezu Technologies" />
        </Field>

        <Field hint="Continues directly from the bold opening above." label="Quote" wide>
          <Textarea defaultValue={testimonial?.quote ?? ""} name="quote" required rows={6} />
        </Field>

        <Field label="Client">
          <Input defaultValue={testimonial?.client ?? ""} name="client" placeholder="Automotive OEM Client" required />
        </Field>

        <Field label="Headline">
          <Input defaultValue={testimonial?.title ?? ""} name="title" placeholder="Exceptional Innovation and Service" required />
        </Field>

        <Field hint="Lowest first. Decides the carousel order." label="Display order">
          <Input defaultValue={testimonial?.sortOrder ?? 0} min={0} name="sortOrder" type="number" />
        </Field>

        <label className="flex items-center gap-2.5 self-end pb-2.5 text-sm text-[var(--dash-fg)]">
          <input
            className="size-4 accent-[var(--dash-primary)]"
            defaultChecked={testimonial?.isPublished ?? true}
            name="isPublished"
            type="checkbox"
          />
          Show on the site
        </label>
      </div>

      <SaveBar isNew={isNew} />
    </form>
  );
}
