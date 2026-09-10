"use client";

import { useState } from "react";
import type { Product, ProductMedia, ProductSection } from "@prisma/client";
import { saveProduct } from "@/app/admin/actions";
import { Button, Input, Label, Select, Textarea } from "@/components/dashboard/ui";
import { MediaUpload } from "@/components/media-upload";

type Pair = { title: string; body: string };

function Field({ children, label, wide }: { readonly children: React.ReactNode; readonly label: string; readonly wide?: boolean }) {
  return <label className={`flex flex-col gap-1.5 ${wide ? "sm:col-span-2" : ""}`}><Label>{label}</Label>{children}</label>;
}

/**
 * One collapsible group of the form, with a caption saying where the fields
 * inside it actually land on the live product page — the form has no visual
 * relationship to the page it edits otherwise, and that gap was most of why
 * nine similar-looking upload fields and six similar-looking list editors
 * read as one undifferentiated wall.
 */
function FormSection({
  title,
  whereItAppears,
  defaultOpen = false,
  children,
}: {
  readonly title: string;
  readonly whereItAppears: string;
  readonly defaultOpen?: boolean;
  readonly children: React.ReactNode;
}) {
  return (
    <details className="group rounded-lg border border-[var(--dash-border)] sm:col-span-2" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-3">
        <div>
          <span className="text-sm font-semibold">{title}</span>
          <p className="mt-0.5 text-xs text-[var(--dash-muted)]">{whereItAppears}</p>
        </div>
        <span aria-hidden className="mt-0.5 shrink-0 text-[var(--dash-muted)] transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="grid grid-cols-1 gap-4 border-t border-[var(--dash-border)] p-4 sm:grid-cols-2">
        {children}
      </div>
    </details>
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
    return { title: String(row.title ?? row.value ?? row.specification ?? ""), body: String(row.body ?? row.label ?? row.details ?? "") };
  });
}

/**
 * A key:value list (metrics, features, specification rows, …) as a stack of
 * numbered cards rather than a grid of near-identical rows — each one reads
 * as "item 3 of the Key Features list", not as an anonymous table line.
 */
function PairEditor({ name, title, firstLabel, secondLabel, initial }: { readonly name: string; readonly title: string; readonly firstLabel: string; readonly secondLabel: string; readonly initial: Pair[] }) {
  const [items, setItems] = useState<Pair[]>(initial);
  const payload = items.map(({ title: first, body: second }) => name === "metrics" ? { value: first, label: second } : name === "specifications" ? { specification: first, details: second } : { title: first, body: second });
  return (
    <div className="sm:col-span-2">
      <span className="text-sm font-semibold">{title}</span>
      <input name={name} type="hidden" value={JSON.stringify(payload)} />
      <div className="mt-2 flex flex-col gap-2">
        {items.map((item, index) => (
          <div className="flex gap-3 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-subtle)] p-3" key={`${name}-${index}`}>
            <span className="mt-2 shrink-0 text-xs font-medium text-[var(--dash-muted)]">#{index + 1}</span>
            <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_2fr]">
              <Input aria-label={`${firstLabel} ${index + 1}`} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, title: event.target.value } : row))} placeholder={firstLabel} value={item.title} />
              <Textarea aria-label={`${secondLabel} ${index + 1}`} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, body: event.target.value } : row))} placeholder={secondLabel} rows={2} value={item.body} />
            </div>
            <Button className="mt-0.5 self-start" onClick={() => setItems((current) => current.filter((_, rowIndex) => rowIndex !== index))} type="button" variant="outline">Remove</Button>
          </div>
        ))}
        <Button className="self-start" onClick={() => setItems((current) => [...current, { title: "", body: "" }])} type="button" variant="outline">
          Add {items.length ? "another" : "a"} row
        </Button>
      </div>
    </div>
  );
}

export function AdminProductForm({ product, media = [], sections = [] }: { readonly product?: Product; readonly media?: ProductMedia[]; readonly sections?: ProductSection[] }) {
  const findSection = (type: ProductSection["type"]) => sections.find((section) => section.type === type);
  const findMedia = (kind: ProductMedia["kind"], index = 0) => media.filter((item) => item.kind === kind).sort((a, b) => a.sortOrder - b.sortOrder)[index];
  const overview = findSection("BENEFITS");
  const specifications = findSection("SPECIFICATIONS");
  const cta = dataObject(findSection("CTA"));
  const isNew = !product;

  return (
    <details className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-fg)] shadow-sm" open={isNew}>
      <summary className="cursor-pointer px-5 py-4 text-sm font-semibold marker:text-[var(--dash-muted)]">{product ? `Edit ${product.name}` : "Add product"}</summary>
      <form action={saveProduct} className="grid grid-cols-1 gap-4 border-t border-[var(--dash-border)] p-5 sm:grid-cols-2">
        <input name="id" type="hidden" value={product?.id ?? ""} />

        <FormSection defaultOpen={isNew} title="Basics" whereItAppears="Not shown on the product page itself — controls the URL, publish state, and where the product sits in the homepage carousel.">
          <Field label="Name"><Input defaultValue={product?.name} name="name" required /></Field>
          <Field label="Slug"><Input defaultValue={product?.slug} name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" required /></Field>
          <Field label="Status"><Select defaultValue={product?.status ?? "DRAFT"} name="status"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></Select></Field>
          <Field label="Carousel order"><Input defaultValue={product?.sortOrder ?? 0} min={0} name="sortOrder" type="number" /></Field>
          <Field label="Homepage card description" wide><Textarea defaultValue={product?.cardDescription ?? ""} name="cardDescription" rows={3} /></Field>
          <div className="sm:col-span-2">
            <MediaUpload hint="The image on this product's card in the homepage carousel — pairs with the description above." initialPublicId={findMedia("CARD")?.cloudinaryPublicId ?? ""} initialUrl={findMedia("CARD")?.url} label="Carousel card image" name="cardUrl" />
          </div>
        </FormSection>

        <FormSection defaultOpen={isNew} title="Hero" whereItAppears="The top of the product page: the big heading, the intro paragraph under it, and the row of stat boxes (e.g. 'Up to 5 kW').">
          <Field label="Hero lead / tagline" wide><Input defaultValue={product?.tagline ?? ""} name="tagline" /></Field>
          <Field label="Hero introduction" wide><Textarea defaultValue={product?.introduction ?? ""} name="introduction" rows={4} /></Field>
          <PairEditor firstLabel="Metric value" initial={itemArray(findSection("METRICS"))} name="metrics" secondLabel="Metric label" title="Stat boxes (up to 3 show)" />
          <div className="sm:col-span-2">
            <MediaUpload hint="The large image shown first in the hero gallery viewer." initialPublicId={findMedia("HERO")?.cloudinaryPublicId ?? ""} initialUrl={findMedia("HERO")?.url} label="Main hero image" name="heroUrl" />
          </div>
          <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
            <MediaUpload hint="First hero thumbnail, beside the main image — hover it to preview." initialPublicId={findMedia("GALLERY", 0)?.cloudinaryPublicId ?? ""} initialUrl={findMedia("GALLERY", 0)?.url} label="Gallery thumbnail 1" name="galleryOneUrl" />
            <MediaUpload hint="Second hero thumbnail." initialPublicId={findMedia("GALLERY", 1)?.cloudinaryPublicId ?? ""} initialUrl={findMedia("GALLERY", 1)?.url} label="Gallery thumbnail 2" name="galleryTwoUrl" />
          </div>
          <Field label="Quote button label"><Input defaultValue={String(cta.quoteLabel ?? "Request a Quote")} name="quoteLabel" /></Field>
          <Field label="Datasheet button label"><Input defaultValue={String(cta.datasheetLabel ?? "Download Datasheet")} name="datasheetLabel" /></Field>
          <div className="sm:col-span-2">
            <MediaUpload accept="application/pdf,.pdf" hint="Opened by the 'Datasheet button label' above." initialPublicId={findMedia("DATASHEET")?.cloudinaryPublicId ?? ""} initialUrl={findMedia("DATASHEET")?.url} label="Datasheet PDF" name="datasheetUrl" />
          </div>
        </FormSection>

        <FormSection defaultOpen={isNew} title="Overview" whereItAppears="The glass panel just below the hero, titled by 'Overview heading' — the second thing a visitor scrolls to.">
          <Field label="Overview heading" wide><Input defaultValue={overview?.title ?? "Built for connected public charging."} name="overviewTitle" /></Field>
          <Field label="Overview introduction" wide><Textarea defaultValue={String(dataObject(overview).intro ?? "")} name="overviewIntro" rows={3} /></Field>
          <PairEditor firstLabel="Benefit title" initial={itemArray(overview)} name="overviewItems" secondLabel="Benefit description" title="Benefits listed in the panel" />
          <div className="sm:col-span-2">
            <MediaUpload hint="Floats over the glass panel, in front of the benefits above." initialPublicId={findMedia("DETAIL")?.cloudinaryPublicId ?? ""} initialUrl={findMedia("DETAIL")?.url} label="Overview detail image" name="detailUrl" />
          </div>
        </FormSection>

        <FormSection defaultOpen={isNew} title="Key Features" whereItAppears="The icon grid section below the Overview panel — up to 6 items show, each with a fixed icon assigned by its position.">
          <Field label="Section heading" wide><Input defaultValue={findSection("FEATURES")?.title ?? "Key Features"} name="featuresTitle" /></Field>
          <PairEditor firstLabel="Feature title" initial={itemArray(findSection("FEATURES"))} name="features" secondLabel="Feature description" title="Features (first 6 show)" />
        </FormSection>

        <FormSection defaultOpen={isNew} title="Applications" whereItAppears="The 3-photo card section below Key Features — each photo below pairs with the application item above it, in order.">
          <Field label="Section heading" wide><Input defaultValue={findSection("ENVIRONMENTS")?.title ?? "Applications"} name="applicationsTitle" /></Field>
          <PairEditor firstLabel="Application title" initial={itemArray(findSection("ENVIRONMENTS"))} name="applications" secondLabel="Application description" title="Applications (first 3 show)" />
          <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3">
            <MediaUpload hint="Matches application item 1 above." initialPublicId={findMedia("APPLICATION", 0)?.cloudinaryPublicId ?? ""} initialUrl={findMedia("APPLICATION", 0)?.url} label="Photo 1" name="applicationOneUrl" />
            <MediaUpload hint="Matches application item 2 above." initialPublicId={findMedia("APPLICATION", 1)?.cloudinaryPublicId ?? ""} initialUrl={findMedia("APPLICATION", 1)?.url} label="Photo 2" name="applicationTwoUrl" />
            <MediaUpload hint="Matches application item 3 above." initialPublicId={findMedia("APPLICATION", 2)?.cloudinaryPublicId ?? ""} initialUrl={findMedia("APPLICATION", 2)?.url} label="Photo 3" name="applicationThreeUrl" />
          </div>
        </FormSection>

        <FormSection defaultOpen={isNew} title="Specifications" whereItAppears="The 'Technical Specifications' table — the first 5 rows show by default, the rest sit behind a 'View all' button.">
          <Field label="Section heading" wide><Input defaultValue={specifications?.title ?? "Technical Specifications"} name="specificationsTitle" /></Field>
          <Field label="Disclaimer under the heading" wide><Input defaultValue={String(dataObject(specifications).note ?? "Specifications vary by product configuration")} name="specificationsNote" /></Field>
          <PairEditor firstLabel="Specification" initial={itemArray(specifications)} name="specifications" secondLabel="Details" title="Table rows" />
        </FormSection>

        <FormSection defaultOpen={isNew} title="SEO" whereItAppears="Not shown on the page — used for search engine results and link previews when this page is shared.">
          <Field label="SEO title"><Input defaultValue={product?.seoTitle ?? ""} maxLength={70} name="seoTitle" /></Field>
          <Field label="SEO description"><Input defaultValue={product?.seoDescription ?? ""} maxLength={160} name="seoDescription" /></Field>
        </FormSection>

        <div className="sm:col-span-2"><Button type="submit">Save product</Button></div>
      </form>
    </details>
  );
}
