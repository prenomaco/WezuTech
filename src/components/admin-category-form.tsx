"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { saveCategory } from "@/app/admin/actions";
import { Button, Input, Label, Textarea } from "@/components/dashboard/ui";
import { IconPicker } from "@/components/dashboard/icon-picker";
import { MediaUpload } from "@/components/media-upload";
import { DEFAULT_ICON } from "@/lib/icon-library";

export interface CategoryFormValues {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly blurb: string;
  readonly image: string | null;
  readonly imagePublicId: string | null;
  readonly icon: string;
  readonly sortOrder: number;
}

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
        href="/admin/categories"
      >
        Cancel
      </Link>
      <Button className="h-10 px-5" disabled={pending} type="submit">
        {pending ? "Saving…" : isNew ? "Add category" : "Save changes"}
      </Button>
    </div>
  );
}

export function AdminCategoryForm({
  category,
  nextSortOrder = 0,
}: {
  readonly category?: CategoryFormValues;
  /** Where a new category lands in the running order, so it goes to the end. */
  readonly nextSortOrder?: number;
}) {
  const isNew = !category;

  return (
    <form action={saveCategory} className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)]">
      <input name="id" type="hidden" value={category?.id ?? ""} />

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <Field label="Name">
          <Input defaultValue={category?.name ?? ""} name="name" placeholder="EV Charging" required />
        </Field>

        <Field hint="The URL: /products/category/<slug>. Changing it changes the address." label="Slug">
          <Input
            defaultValue={category?.slug ?? ""}
            name="slug"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="ev-charging"
            required
          />
        </Field>

        <Field
          hint="One or two sentences. Shown on the category card and as the page's own introduction."
          label="Description"
          wide
        >
          <Textarea defaultValue={category?.blurb ?? ""} name="blurb" required rows={3} />
        </Field>

        <IconPicker
          hint="Shown on the category card whenever there is no image."
          value={category?.icon ?? DEFAULT_ICON}
        />

        <Field hint="Lowest first. Decides the order on the products index." label="Display order">
          <Input
            defaultValue={category?.sortOrder ?? nextSortOrder}
            min={0}
            name="sortOrder"
            type="number"
          />
        </Field>

        <div className="sm:col-span-2">
          <MediaUpload
            hint="Optional. Replaces the icon on the category card once uploaded."
            initialPublicId={category?.imagePublicId ?? ""}
            initialUrl={category?.image ?? ""}
            label="Category image"
            name="image"
          />
        </div>
      </div>

      <SaveBar isNew={isNew} />
    </form>
  );
}
