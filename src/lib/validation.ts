import { z } from "zod";

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
  tagline: z.string().trim().max(200).optional(),
  cardDescription: z.string().trim().max(500).optional(),
  introduction: z.string().trim().max(5000).optional(),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(160).optional(),
  imageUrl: z.string().url().optional(),
  imagePublicId: z.string().max(500).optional(),
});
