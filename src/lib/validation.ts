import { z } from "zod";
import {
  contentItemSchema,
  ctaSchema,
  metricSchema,
  specificationSchema,
} from "@/lib/product-detail";

const mediaUrl = z.string().trim().refine((value) => value.startsWith("/") || URL.canParse(value), "Enter an absolute URL or a site-relative path.");

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(4000),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(120).optional(),
  productSlug: z.string().trim().max(160).optional(),
  website: z.string().max(0).optional(),
});

export const productInputSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
  tagline: z.string().trim().max(200).optional(),
  cardDescription: z.string().trim().max(500).optional(),
  introduction: z.string().trim().max(5000).optional(),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(160).optional(),
  cardUrl: mediaUrl.optional(),
  cardUrlPublicId: z.string().max(500).optional(),
  heroUrl: mediaUrl.optional(),
  heroUrlPublicId: z.string().max(500).optional(),
  detailUrl: mediaUrl.optional(),
  detailUrlPublicId: z.string().max(500).optional(),
  galleryOneUrl: mediaUrl.optional(),
  galleryOneUrlPublicId: z.string().max(500).optional(),
  galleryTwoUrl: mediaUrl.optional(),
  galleryTwoUrlPublicId: z.string().max(500).optional(),
  applicationOneUrl: mediaUrl.optional(),
  applicationOneUrlPublicId: z.string().max(500).optional(),
  applicationTwoUrl: mediaUrl.optional(),
  applicationTwoUrlPublicId: z.string().max(500).optional(),
  applicationThreeUrl: mediaUrl.optional(),
  applicationThreeUrlPublicId: z.string().max(500).optional(),
  datasheetUrl: mediaUrl.optional(),
  datasheetUrlPublicId: z.string().max(500).optional(),
  metricsTitle: z.string().trim().max(120).optional(),
  metrics: z.array(metricSchema).max(12),
  overviewTitle: z.string().trim().max(160).optional(),
  overviewIntro: z.string().trim().max(2000).optional(),
  overviewItems: z.array(contentItemSchema).max(12),
  featuresTitle: z.string().trim().max(160).optional(),
  features: z.array(contentItemSchema).max(20),
  applicationsTitle: z.string().trim().max(160).optional(),
  applications: z.array(contentItemSchema).max(20),
  specificationsTitle: z.string().trim().max(160).optional(),
  specifications: z.array(specificationSchema).max(30),
  specificationsNote: z.string().trim().max(500).optional(),
  cta: ctaSchema,
});

export const testimonialInputSchema = z.object({
  id: z.string().cuid().optional(),
  lead: z.string().trim().max(160).optional(),
  quote: z.string().trim().min(10).max(3000),
  client: z.string().trim().min(2).max(160),
  title: z.string().trim().min(2).max(200),
  isPublished: z.coerce.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(10000),
});
