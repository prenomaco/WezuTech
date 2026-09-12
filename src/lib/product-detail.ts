import { cache } from "react";
import { ProductMediaKind, ProductSectionType, ProductStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const metricSchema = z.object({ value: z.string().trim().min(1).max(80), label: z.string().trim().min(1).max(120) });
export const contentItemSchema = z.object({ title: z.string().trim().min(1).max(160), body: z.string().trim().min(1).max(1200) });
export const specificationSchema = z.object({ specification: z.string().trim().min(1).max(120), details: z.string().trim().min(1).max(300) });
export const overviewSchema = z.object({ intro: z.string().trim().max(2000).default(""), items: z.array(contentItemSchema).max(12).default([]) });
export const listSectionSchema = z.object({ items: z.array(contentItemSchema).max(20).default([]) });
/*
 * A feature carries its own glyph.
 *
 * The product page drew the six feature marks from a fixed list indexed by
 * position, so "Liquid Cooling" wore whichever icon happened to be sixth and
 * every product in the catalogue showed the same six marks in the same order.
 * The key is chosen per feature in the dashboard now. Empty means not chosen
 * and resolves to the library's default rather than failing to parse, so rows
 * written before the field existed still load.
 */
export const featureItemSchema = contentItemSchema.extend({ icon: z.string().trim().max(60).default("") });
export const featureSectionSchema = z.object({ items: z.array(featureItemSchema).max(20).default([]) });
export const specificationSectionSchema = z.object({ items: z.array(specificationSchema).max(30).default([]), note: z.string().trim().max(500).default("") });
export const ctaSchema = z.object({ quoteLabel: z.string().trim().min(1).max(60).default("Request a Quote"), datasheetLabel: z.string().trim().min(1).max(60).default("Download Datasheet") });

export type ProductMetric = z.infer<typeof metricSchema>;
export type ProductContentItem = z.infer<typeof contentItemSchema>;
export type ProductFeatureItem = z.infer<typeof featureItemSchema>;
export type ProductSpecification = z.infer<typeof specificationSchema>;
export type ProductCta = z.infer<typeof ctaSchema>;

export interface ProductMediaSlots {
  readonly card: string;
  readonly hero: string;
  readonly detail?: string;
  readonly gallery: readonly { url: string; alt: string }[];
  readonly applications: readonly { url: string; alt: string }[];
  readonly datasheet?: string;
}

export interface ProductDetail {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly tagline: string;
  readonly introduction: string;
  readonly seoTitle: string | null;
  readonly seoDescription: string | null;
  readonly metrics: readonly ProductMetric[];
  readonly overview: { readonly title: string; readonly intro: string; readonly items: readonly ProductContentItem[] };
  readonly features: { readonly title: string; readonly items: readonly ProductFeatureItem[] };
  readonly applications: { readonly title: string; readonly items: readonly ProductContentItem[] };
  readonly specifications: { readonly title: string; readonly items: readonly ProductSpecification[]; readonly note: string };
  readonly cta: ProductCta;
  readonly media: ProductMediaSlots;
}

function legacyItems<T>(data: unknown, schema: z.ZodType<T>): T | undefined {
  const result = schema.safeParse(data);
  return result.success ? result.data : undefined;
}

/** Converts both the original array-shaped seed data and the canonical editor payloads. */
export function normalizeProductSectionData(type: ProductSectionType, data: unknown) {
  if (type === ProductSectionType.METRICS) {
    const raw = Array.isArray(data) ? data : (data as { items?: unknown } | null)?.items;
    return legacyItems(raw, z.array(metricSchema).max(12)) ?? [];
  }
  if (type === ProductSectionType.BENEFITS) {
    if (Array.isArray(data)) return { intro: "", items: legacyItems(data, z.array(contentItemSchema)) ?? [] };
    return legacyItems(data, overviewSchema) ?? { intro: "", items: [] };
  }
  if (type === ProductSectionType.SPECIFICATIONS) {
    if (Array.isArray(data)) return { items: legacyItems(data, z.array(specificationSchema)) ?? [], note: "" };
    return legacyItems(data, specificationSectionSchema) ?? { items: [], note: "" };
  }
  if (type === ProductSectionType.FEATURES) {
    if (Array.isArray(data)) return { items: legacyItems(data, z.array(featureItemSchema)) ?? [] };
    return legacyItems(data, featureSectionSchema) ?? { items: [] };
  }
  if (type === ProductSectionType.CTA) return legacyItems(data, ctaSchema) ?? ctaSchema.parse({});
  if (Array.isArray(data)) return { items: legacyItems(data, z.array(contentItemSchema)) ?? [] };
  return legacyItems(data, listSectionSchema) ?? { items: [] };
}

export const getProductDetail = cache(async (slug: string): Promise<ProductDetail | null> => {
  const product = await prisma.product.findFirst({
    where: { slug, status: ProductStatus.PUBLISHED },
    include: { media: { orderBy: { sortOrder: "asc" } }, sections: { orderBy: { sortOrder: "asc" } } },
  });
  if (!product) return null;

  const byType = new Map(product.sections.map((section) => [section.type, section]));
  const metrics = normalizeProductSectionData(ProductSectionType.METRICS, byType.get(ProductSectionType.METRICS)?.data) as ProductMetric[];
  const overviewData = normalizeProductSectionData(ProductSectionType.BENEFITS, byType.get(ProductSectionType.BENEFITS)?.data) as z.infer<typeof overviewSchema>;
  const featureData = normalizeProductSectionData(ProductSectionType.FEATURES, byType.get(ProductSectionType.FEATURES)?.data) as z.infer<typeof featureSectionSchema>;
  const applicationData = normalizeProductSectionData(ProductSectionType.ENVIRONMENTS, byType.get(ProductSectionType.ENVIRONMENTS)?.data) as z.infer<typeof listSectionSchema>;
  const specificationData = normalizeProductSectionData(ProductSectionType.SPECIFICATIONS, byType.get(ProductSectionType.SPECIFICATIONS)?.data) as z.infer<typeof specificationSectionSchema>;
  const cta = normalizeProductSectionData(ProductSectionType.CTA, byType.get(ProductSectionType.CTA)?.data) as ProductCta;
  const first = (kind: ProductMediaKind) => product.media.find((item) => item.kind === kind)?.url;
  const card = first(ProductMediaKind.CARD) ?? "";

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    tagline: product.tagline ?? "",
    introduction: product.introduction ?? "",
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    metrics,
    overview: { title: byType.get(ProductSectionType.BENEFITS)?.title ?? "", ...overviewData },
    features: { title: byType.get(ProductSectionType.FEATURES)?.title ?? "Key Features", ...featureData },
    applications: { title: byType.get(ProductSectionType.ENVIRONMENTS)?.title ?? "Applications", ...applicationData },
    specifications: { title: byType.get(ProductSectionType.SPECIFICATIONS)?.title ?? "Technical Specifications", ...specificationData },
    cta,
    media: {
      card,
      hero: first(ProductMediaKind.HERO) ?? card,
      detail: first(ProductMediaKind.DETAIL),
      gallery: product.media.filter((item) => item.kind === ProductMediaKind.GALLERY).map(({ url, alt }) => ({ url, alt })),
      applications: product.media.filter((item) => item.kind === ProductMediaKind.APPLICATION).map(({ url, alt }) => ({ url, alt })),
      datasheet: first(ProductMediaKind.DATASHEET),
    },
  };
});
