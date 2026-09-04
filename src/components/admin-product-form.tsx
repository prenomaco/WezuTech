import type { Product, ProductMedia } from "@prisma/client";
import { saveProduct } from "@/app/admin/actions";
import {
  Button,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/dashboard/ui";
import { MediaUpload } from "@/components/media-upload";

/**
 * The product editor.
 *
 * It used to carry its own light-on-white stylesheet, left over from before
 * the dashboard had a design — which put a sheet of white in the middle of a
 * dark page. It is built from the same primitives as the rest of the console
 * now, so it reads from `--dash-*` like everything else.
 *
 * A row is a `<details>` because the page lists every product's editor at
 * once; only the "Add product" one starts open.
 */
function Field({
  children,
  label,
  wide,
}: {
  readonly children: React.ReactNode;
  readonly label: string;
  readonly wide?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
    </label>
  );
}

export function AdminProductForm({
  product,
  media,
}: {
  readonly product?: Product;
  readonly media?: ProductMedia | null;
}) {
  return (
    <details
      className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-fg)] shadow-sm"
      open={!product}
    >
      <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-[var(--dash-fg)] marker:text-[var(--dash-muted)]">
        {product ? `Edit ${product.name}` : "Add product"}
      </summary>

      <form
        action={saveProduct}
        className="grid grid-cols-1 gap-4 border-t border-[var(--dash-border)] p-5 sm:grid-cols-2"
      >
        <input name="id" type="hidden" value={product?.id ?? ""} />

        <Field label="Name">
          <Input defaultValue={product?.name} name="name" required />
        </Field>

        <Field label="Slug">
          <Input
            defaultValue={product?.slug}
            name="slug"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            required
          />
        </Field>

        <Field label="Status">
          <Select defaultValue={product?.status ?? "DRAFT"} name="status">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </Field>

        <Field label="Tagline">
          <Input defaultValue={product?.tagline ?? ""} name="tagline" />
        </Field>

        <Field label="Card description" wide>
          <Textarea
            defaultValue={product?.cardDescription ?? ""}
            name="cardDescription"
            rows={3}
          />
        </Field>

        <Field label="Introduction" wide>
          <Textarea
            defaultValue={product?.introduction ?? ""}
            name="introduction"
            rows={4}
          />
        </Field>

        <Field label="SEO title">
          <Input
            defaultValue={product?.seoTitle ?? ""}
            maxLength={70}
            name="seoTitle"
          />
        </Field>

        <Field label="SEO description">
          <Input
            defaultValue={product?.seoDescription ?? ""}
            maxLength={160}
            name="seoDescription"
          />
        </Field>

        <MediaUpload initialUrl={media?.url} />

        <div className="sm:col-span-2">
          <Button type="submit">Save product</Button>
        </div>
      </form>
    </details>
  );
}
