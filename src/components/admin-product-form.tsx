"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product, ProductMedia, ProductSection } from "@prisma/client";
import { useFormStatus } from "react-dom";
import { saveProduct } from "@/app/admin/actions";
import { Button, Input, Label, Select, Textarea } from "@/components/dashboard/ui";
import { IconPicker } from "@/components/dashboard/icon-picker";
import { GalleryUpload, MediaUpload, type GalleryImage } from "@/components/media-upload";

type Pair = { title: string; body: string; icon: string };

function Field({
  children,
  label,
  hint,
  wide,
}: {
  readonly children: React.ReactNode;
  readonly label: string;
  /** A line under the label, for fields whose effect is not obvious. */
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

/**
 * One group of the form, with a caption saying where the fields inside it
 * actually land on the live product page — the form has no visual
 * relationship to the page it edits otherwise, and that gap was most of why
 * nine similar-looking upload fields and six similar-looking list editors
 * read as one undifferentiated wall.
 *
 * A card, not a `<details>`. Collapsed sections made sense when every product
 * rendered a form on the index page and they all had to be folded away; on a
 * page of its own the form should show its work, and a section you have to
 * open is a field you can forget to fill in.
 */
function FormSection({
  title,
  whereItAppears,
  children,
}: {
  readonly title: string;
  readonly whereItAppears: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)]">
      <div className="border-b border-[var(--dash-border)] px-5 py-4">
        <h2 className="text-sm font-semibold text-[var(--dash-fg)]">{title}</h2>
        <p className="mt-0.5 text-xs text-[var(--dash-muted)]">{whereItAppears}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function dataObject(section: ProductSection | undefined): Record<string, unknown> {
  if (!section || !section.data || Array.isArray(section.data) || typeof section.data !== "object") return {};
  return section.data as Record<string, unknown>;
}

function itemArray(section: ProductSection | undefined): Pair[] {
  const source = Array.isArray(section?.data) ? section.data : dataObject(section).items;
  if (!Array.isArray(source)) return [];
  return source.map((item) => {
    const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return {
      title: String(row.title ?? row.value ?? row.specification ?? ""),
      body: String(row.body ?? row.label ?? row.details ?? ""),
      icon: String(row.icon ?? ""),
    };
  });
}

/**
 * A key:value list (metrics, features, specification rows, …) as a stack of
 * numbered cards rather than a grid of near-identical rows — each one reads
 * as "item 3 of the Key Features list", not as an anonymous table line.
 */
function PairEditor({ name, title, firstLabel, secondLabel, initial, withIcons = false }: { readonly name: string; readonly title: string; readonly firstLabel: string; readonly secondLabel: string; readonly initial: Pair[]; readonly withIcons?: boolean }) {
  const [items, setItems] = useState<Pair[]>(initial);
  const payload = items.map(({ title: first, body: second, icon }) => name === "metrics" ? { value: first, label: second } : name === "specifications" ? { specification: first, details: second } : withIcons ? { title: first, body: second, icon } : { title: first, body: second });
  return (
    <div className="sm:col-span-2">
      <span className="text-sm font-semibold">{title}</span>
      <input name={name} type="hidden" value={JSON.stringify(payload)} />
      <div className="mt-2 flex flex-col gap-2">
        {items.map((item, index) => (
          <div className="flex gap-3 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-subtle)] p-3" key={`${name}-${index}`}>
            {/* For features, the glyph the public page draws above the
                feature replaces the row number: the number was only ever a
                position marker, and the icon says which row this is far
                better than "#3" did. */}
            {withIcons ? (
              <IconPicker
                label={`${firstLabel} ${index + 1} icon`}
                name=""
                onChange={(next) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, icon: next } : row))}
                value={item.icon}
                variant="compact"
              />
            ) : (
              <span className="mt-2 shrink-0 text-xs font-medium text-[var(--dash-muted)]">#{index + 1}</span>
            )}
            <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_2fr]">
              <Input aria-label={`${firstLabel} ${index + 1}`} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, title: event.target.value } : row))} placeholder={firstLabel} value={item.title} />
              <Textarea aria-label={`${secondLabel} ${index + 1}`} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, body: event.target.value } : row))} placeholder={secondLabel} rows={2} value={item.body} />
            </div>
            <Button className="mt-0.5 self-start" onClick={() => setItems((current) => current.filter((_, rowIndex) => rowIndex !== index))} type="button" variant="outline">Remove</Button>
          </div>
        ))}
        <Button className="self-start" onClick={() => setItems((current) => [...current, { title: "", body: "", icon: "" }])} type="button" variant="outline">
          Add {items.length ? "another" : "a"} row
        </Button>
      </div>
    </div>
  );
}

/**
 * Which product families this product belongs to.
 *
 * Checkboxes rather than a `<select multiple>`: a handful of categories all
 * fit on screen, and a multi-select requires the reader to know to hold a
 * modifier key. A product genuinely belongs to several — a DC fast charger is
 * charging hardware, power electronics and thermal management at once — which
 * is why the join is many-to-many rather than a column.
 *
 * The options come from the database, so adding a family in Categories makes
 * it selectable here with no code change.
 */
function CategoryPicker({
  selected,
  options,
}: {
  readonly selected: readonly string[];
  readonly options: readonly { slug: string; name: string }[];
}) {
  const [chosen, setChosen] = useState<readonly string[]>(selected);

  if (!options.length) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--dash-border-strong)] p-4 text-xs text-[var(--dash-muted)] sm:col-span-2">
        No categories yet. Add them under Categories and they will appear here.
      </p>
    );
  }

  return (
    <fieldset className="sm:col-span-2">
      <legend className="text-sm font-semibold text-[var(--dash-fg)]">Categories</legend>
      <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
        Decides which category pages list this product. Leaving all of them clear hides it from
        every category page, though it still shows in the full catalogue.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((category) => {
          const active = chosen.includes(category.slug);
          return (
            <label
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "border-[var(--dash-primary)] bg-[rgb(9_133_204/0.12)] text-[var(--dash-fg)]"
                  : "border-[var(--dash-border)] text-[var(--dash-muted)] hover:bg-[var(--dash-subtle)]"
              }`}
              key={category.slug}
            >
              <input
                checked={active}
                className="size-4 accent-[var(--dash-primary)]"
                name="categorySlugs"
                onChange={(event) =>
                  setChosen((current) =>
                    event.target.checked
                      ? [...current, category.slug]
                      : current.filter((slug) => slug !== category.slug),
                  )
                }
                type="checkbox"
                value={category.slug}
              />
              {category.name}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Sticky, so Save is reachable without scrolling to the end of a long form. */
function SaveBar({ isNew }: { readonly isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div className="sticky bottom-0 z-10 -mx-6 flex items-center justify-end gap-3 border-t border-[var(--dash-border-strong)] bg-[var(--dash-bg)]/95 px-6 py-4 backdrop-blur lg:-mx-10 lg:px-10">
      <Link
        className="inline-flex h-10 items-center rounded-lg border border-[var(--dash-border-strong)] px-4 text-sm font-medium text-[var(--dash-fg)] transition-colors hover:bg-[var(--dash-subtle)]"
        href="/admin/products"
      >
        Cancel
      </Link>
      <Button className="h-10 px-5" disabled={pending} type="submit">
        {pending ? "Saving…" : isNew ? "Create product" : "Save changes"}
      </Button>
    </div>
  );
}

export function AdminProductForm({
  product,
  media = [],
  sections = [],
  categorySlugs = [],
  categoryOptions,
}: {
  readonly product?: Product;
  readonly media?: ProductMedia[];
  readonly sections?: ProductSection[];
  readonly categorySlugs?: readonly string[];
  readonly categoryOptions: readonly { slug: string; name: string }[];
}) {
  const findSection = (type: ProductSection["type"]) => sections.find((section) => section.type === type);
  const findMedia = (kind: ProductMedia["kind"], index = 0) => media.filter((item) => item.kind === kind).sort((a, b) => a.sortOrder - b.sortOrder)[index];
  const overview = findSection("BENEFITS");
  const specifications = findSection("SPECIFICATIONS");
  const cta = dataObject(findSection("CTA"));
  const isNew = !product;
  const galleryImages: GalleryImage[] = media
    .filter((item) => item.kind === "GALLERY")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({ url: item.url, publicId: item.cloudinaryPublicId ?? "" }));

  return (
    <form action={saveProduct} className="flex flex-col gap-4">
      <input name="id" type="hidden" value={product?.id ?? ""} />

      <FormSection title="Basics" whereItAppears="Not shown on the product page itself. Controls the URL, publish state, and where the product sits in the homepage carousel.">
        <Field label="Name"><Input defaultValue={product?.name} name="name" required /></Field>
        <Field label="Slug"><Input defaultValue={product?.slug} name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" required /></Field>
        <Field label="Status"><Select defaultValue={product?.status ?? "DRAFT"} name="status"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></Select></Field>
        <Field label="Carousel order"><Input defaultValue={product?.sortOrder ?? 0} min={0} name="sortOrder" type="number" /></Field>
        <CategoryPicker options={categoryOptions} selected={categorySlugs} />
        <Field
          hint="Two short paragraphs read best: what it is, then what it is for. A blank line starts a new paragraph."
          label="Catalogue card description"
          wide
        >
          <Textarea defaultValue={product?.cardDescription ?? ""} name="cardDescription" rows={6} />
        </Field>
      </FormSection>

      <FormSection title="Hero" whereItAppears="The top of the product page: the big heading, the intro paragraph under it, and the row of stat boxes (e.g. 'Up to 5 kW').">
        <Field label="Hero lead / tagline" wide><Input defaultValue={product?.tagline ?? ""} name="tagline" /></Field>
        <Field label="Hero introduction" wide><Textarea defaultValue={product?.introduction ?? ""} name="introduction" rows={4} /></Field>
        <PairEditor firstLabel="Metric value" initial={itemArray(findSection("METRICS"))} name="metrics" secondLabel="Metric label" title="Stat boxes (up to 3 show)" />
        <div className="sm:col-span-2">
          <MediaUpload
            hint="Used in three places: the main image at the top of this product's page, its card in the home page carousel, and its thumbnail on the products index and category pages. Upload once and all three follow."
            initialPublicId={findMedia("HERO")?.cloudinaryPublicId ?? ""}
            initialUrl={findMedia("HERO")?.url}
            label="Main product image"
            name="heroUrl"
          />
        </div>
        <GalleryUpload initial={galleryImages} />
        <Field label="Quote button label"><Input defaultValue={String(cta.quoteLabel ?? "Request a Quote")} name="quoteLabel" /></Field>
        <Field label="Datasheet button label"><Input defaultValue={String(cta.datasheetLabel ?? "Download Datasheet")} name="datasheetLabel" /></Field>
        <div className="sm:col-span-2">
          <MediaUpload accept="application/pdf,.pdf" hint="Opened by the 'Datasheet button label' above." initialPublicId={findMedia("DATASHEET")?.cloudinaryPublicId ?? ""} initialUrl={findMedia("DATASHEET")?.url} label="Datasheet PDF" name="datasheetUrl" />
        </div>
      </FormSection>

      <FormSection title="Overview" whereItAppears="The glass panel just below the hero, titled by 'Overview heading'. The second thing a visitor scrolls to.">
        <Field label="Overview heading" wide><Input defaultValue={overview?.title ?? "Built for connected public charging."} name="overviewTitle" /></Field>
        <Field label="Overview introduction" wide><Textarea defaultValue={String(dataObject(overview).intro ?? "")} name="overviewIntro" rows={3} /></Field>
        <PairEditor firstLabel="Benefit title" initial={itemArray(overview)} name="overviewItems" secondLabel="Benefit description" title="Benefits listed in the panel" />
        <div className="sm:col-span-2">
          <MediaUpload hint="Floats over the glass panel, in front of the benefits above." initialPublicId={findMedia("DETAIL")?.cloudinaryPublicId ?? ""} initialUrl={findMedia("DETAIL")?.url} label="Overview detail image" name="detailUrl" />
        </div>
      </FormSection>

      <FormSection title="Key Features" whereItAppears="The icon grid section below the Overview panel. Up to 6 items show. The icon beside each row is the mark drawn above it on the page: click it to search the library.">
        <Field label="Section heading" wide><Input defaultValue={findSection("FEATURES")?.title ?? "Key Features"} name="featuresTitle" /></Field>
        <PairEditor firstLabel="Feature" initial={itemArray(findSection("FEATURES"))} name="features" secondLabel="Feature description" title="Features (first 6 show)" withIcons />
      </FormSection>

      <FormSection title="Applications" whereItAppears="The 3-photo card section below Key Features. Each photo below pairs with the application item above it, in order.">
        <Field label="Section heading" wide><Input defaultValue={findSection("ENVIRONMENTS")?.title ?? "Applications"} name="applicationsTitle" /></Field>
        <PairEditor firstLabel="Application title" initial={itemArray(findSection("ENVIRONMENTS"))} name="applications" secondLabel="Application description" title="Applications (first 3 show)" />
        <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
          <MediaUpload hint="Matches application item 1 above." initialPublicId={findMedia("APPLICATION", 0)?.cloudinaryPublicId ?? ""} initialUrl={findMedia("APPLICATION", 0)?.url} label="Photo 1" name="applicationOneUrl" />
          <MediaUpload hint="Matches application item 2 above." initialPublicId={findMedia("APPLICATION", 1)?.cloudinaryPublicId ?? ""} initialUrl={findMedia("APPLICATION", 1)?.url} label="Photo 2" name="applicationTwoUrl" />
          <MediaUpload hint="Matches application item 3 above." initialPublicId={findMedia("APPLICATION", 2)?.cloudinaryPublicId ?? ""} initialUrl={findMedia("APPLICATION", 2)?.url} label="Photo 3" name="applicationThreeUrl" />
        </div>
      </FormSection>

      <FormSection title="Specifications" whereItAppears="The 'Technical Specifications' table. The first 5 rows show by default, the rest sit behind a 'View all' button.">
        <Field label="Section heading" wide><Input defaultValue={specifications?.title ?? "Technical Specifications"} name="specificationsTitle" /></Field>
        <Field label="Disclaimer under the heading" wide><Input defaultValue={String(dataObject(specifications).note ?? "Specifications vary by product configuration")} name="specificationsNote" /></Field>
        <PairEditor firstLabel="Specification" initial={itemArray(specifications)} name="specifications" secondLabel="Details" title="Table rows" />
      </FormSection>

      <FormSection title="SEO" whereItAppears="Not shown on the page. Used for search engine results and link previews when this page is shared.">
        <Field label="SEO title"><Input defaultValue={product?.seoTitle ?? ""} maxLength={70} name="seoTitle" /></Field>
        <Field label="SEO description"><Input defaultValue={product?.seoDescription ?? ""} maxLength={160} name="seoDescription" /></Field>
      </FormSection>

      <SaveBar isNew={isNew} />
    </form>
  );
}
