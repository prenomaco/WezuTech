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

function PairEditor({ name, title, firstLabel, secondLabel, initial }: { readonly name: string; readonly title: string; readonly firstLabel: string; readonly secondLabel: string; readonly initial: Pair[] }) {
  const [items, setItems] = useState<Pair[]>(initial);
  const payload = items.map(({ title: first, body: second }) => name === "metrics" ? { value: first, label: second } : name === "specifications" ? { specification: first, details: second } : { title: first, body: second });
  return (
    <fieldset className="sm:col-span-2 rounded-lg border border-[var(--dash-border)] p-4">
      <legend className="px-1 text-sm font-semibold">{title}</legend>
      <input name={name} type="hidden" value={JSON.stringify(payload)} />
      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <div className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]" key={`${name}-${index}`}>
            <Input aria-label={`${firstLabel} ${index + 1}`} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, title: event.target.value } : row))} placeholder={firstLabel} value={item.title} />
            <Textarea aria-label={`${secondLabel} ${index + 1}`} onChange={(event) => setItems((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, body: event.target.value } : row))} placeholder={secondLabel} rows={2} value={item.body} />
            <Button className="self-start" onClick={() => setItems((current) => current.filter((_, rowIndex) => rowIndex !== index))} type="button" variant="outline">Remove</Button>
          </div>
        ))}
        <Button className="self-start" onClick={() => setItems((current) => [...current, { title: "", body: "" }])} type="button" variant="outline">Add row</Button>
      </div>
    </fieldset>
  );
}

export function AdminProductForm({ product, media = [], sections = [] }: { readonly product?: Product; readonly media?: ProductMedia[]; readonly sections?: ProductSection[] }) {
  const findSection = (type: ProductSection["type"]) => sections.find((section) => section.type === type);
  const findMedia = (kind: ProductMedia["kind"], index = 0) => media.filter((item) => item.kind === kind).sort((a, b) => a.sortOrder - b.sortOrder)[index];
  const overview = findSection("BENEFITS");
  const specifications = findSection("SPECIFICATIONS");
  const cta = dataObject(findSection("CTA"));

  return (
    <details className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)] text-[var(--dash-fg)] shadow-sm" open={!product}>
      <summary className="cursor-pointer px-5 py-4 text-sm font-semibold marker:text-[var(--dash-muted)]">{product ? `Edit ${product.name}` : "Add product"}</summary>
      <form action={saveProduct} className="grid grid-cols-1 gap-4 border-t border-[var(--dash-border)] p-5 sm:grid-cols-2">
        <input name="id" type="hidden" value={product?.id ?? ""} />
        <Field label="Name"><Input defaultValue={product?.name} name="name" required /></Field>
        <Field label="Slug"><Input defaultValue={product?.slug} name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" required /></Field>
        <Field label="Status"><Select defaultValue={product?.status ?? "DRAFT"} name="status"><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></Select></Field>
        <Field label="Carousel order"><Input defaultValue={product?.sortOrder ?? 0} min={0} name="sortOrder" type="number" /></Field>
        <Field label="Hero lead / tagline" wide><Input defaultValue={product?.tagline ?? ""} name="tagline" /></Field>
        <Field label="Card description" wide><Textarea defaultValue={product?.cardDescription ?? ""} name="cardDescription" rows={3} /></Field>
        <Field label="Hero introduction" wide><Textarea defaultValue={product?.introduction ?? ""} name="introduction" rows={4} /></Field>
        <PairEditor firstLabel="Metric value" initial={itemArray(findSection("METRICS"))} name="metrics" secondLabel="Metric label" title="Hero metrics" />
        <Field label="Overview heading" wide><Input defaultValue={overview?.title ?? "Built for connected public charging."} name="overviewTitle" /></Field>
        <Field label="Overview introduction" wide><Textarea defaultValue={String(dataObject(overview).intro ?? "")} name="overviewIntro" rows={3} /></Field>
        <PairEditor firstLabel="Benefit title" initial={itemArray(overview)} name="overviewItems" secondLabel="Benefit description" title="Overview benefits" />
        <Field label="Features heading" wide><Input defaultValue={findSection("FEATURES")?.title ?? "Key Features"} name="featuresTitle" /></Field>
        <PairEditor firstLabel="Feature title" initial={itemArray(findSection("FEATURES"))} name="features" secondLabel="Feature description" title="Key features" />
        <Field label="Applications heading" wide><Input defaultValue={findSection("ENVIRONMENTS")?.title ?? "Applications"} name="applicationsTitle" /></Field>
        <PairEditor firstLabel="Application title" initial={itemArray(findSection("ENVIRONMENTS"))} name="applications" secondLabel="Application description" title="Applications" />
        <Field label="Specifications heading" wide><Input defaultValue={specifications?.title ?? "Technical Specifications"} name="specificationsTitle" /></Field>
        <PairEditor firstLabel="Specification" initial={itemArray(specifications)} name="specifications" secondLabel="Details" title="Specifications table" />
        <Field label="Specifications disclaimer" wide><Input defaultValue={String(dataObject(specifications).note ?? "Specifications vary by product configuration")} name="specificationsNote" /></Field>
        <Field label="Quote button label"><Input defaultValue={String(cta.quoteLabel ?? "Request a Quote")} name="quoteLabel" /></Field>
        <Field label="Datasheet button label"><Input defaultValue={String(cta.datasheetLabel ?? "Download Datasheet")} name="datasheetLabel" /></Field>
        <MediaUpload initialPublicId={findMedia("CARD")?.cloudinaryPublicId ?? ""} initialUrl={findMedia("CARD")?.url} label="Homepage carousel image" name="cardUrl" />
        <MediaUpload initialPublicId={findMedia("HERO")?.cloudinaryPublicId ?? ""} initialUrl={findMedia("HERO")?.url} label="Product hero image" name="heroUrl" />
        <MediaUpload initialPublicId={findMedia("DETAIL")?.cloudinaryPublicId ?? ""} initialUrl={findMedia("DETAIL")?.url} label="Secondary detail image" name="detailUrl" />
        <MediaUpload initialPublicId={findMedia("GALLERY", 0)?.cloudinaryPublicId ?? ""} initialUrl={findMedia("GALLERY", 0)?.url} label="Alternate image one" name="galleryOneUrl" />
        <MediaUpload initialPublicId={findMedia("GALLERY", 1)?.cloudinaryPublicId ?? ""} initialUrl={findMedia("GALLERY", 1)?.url} label="Alternate image two" name="galleryTwoUrl" />
        <MediaUpload initialPublicId={findMedia("APPLICATION", 0)?.cloudinaryPublicId ?? ""} initialUrl={findMedia("APPLICATION", 0)?.url} label="Application image one" name="applicationOneUrl" />
        <MediaUpload initialPublicId={findMedia("APPLICATION", 1)?.cloudinaryPublicId ?? ""} initialUrl={findMedia("APPLICATION", 1)?.url} label="Application image two" name="applicationTwoUrl" />
        <MediaUpload initialPublicId={findMedia("APPLICATION", 2)?.cloudinaryPublicId ?? ""} initialUrl={findMedia("APPLICATION", 2)?.url} label="Application image three" name="applicationThreeUrl" />
        <MediaUpload accept="application/pdf,.pdf" initialPublicId={findMedia("DATASHEET")?.cloudinaryPublicId ?? ""} initialUrl={findMedia("DATASHEET")?.url} label="Product datasheet" name="datasheetUrl" />
        <Field label="SEO title"><Input defaultValue={product?.seoTitle ?? ""} maxLength={70} name="seoTitle" /></Field>
        <Field label="SEO description"><Input defaultValue={product?.seoDescription ?? ""} maxLength={160} name="seoDescription" /></Field>
        <div className="sm:col-span-2"><Button type="submit">Save product</Button></div>
      </form>
    </details>
  );
}
