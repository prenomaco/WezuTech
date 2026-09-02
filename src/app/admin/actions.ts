"use server";

import { ProductMediaKind, ProductStatus, LeadStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { productInputSchema } from "@/lib/validation";

const nullable = (value: FormDataEntryValue | null) => typeof value === "string" && value.trim() ? value.trim() : null;

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const input = productInputSchema.parse({
    id: nullable(formData.get("id")) ?? undefined,
    name: formData.get("name"), slug: formData.get("slug"), status: formData.get("status"),
    tagline: nullable(formData.get("tagline")) ?? undefined, cardDescription: nullable(formData.get("cardDescription")) ?? undefined,
    introduction: nullable(formData.get("introduction")) ?? undefined, seoTitle: nullable(formData.get("seoTitle")) ?? undefined,
    seoDescription: nullable(formData.get("seoDescription")) ?? undefined, imageUrl: nullable(formData.get("imageUrl")) ?? undefined,
    imagePublicId: nullable(formData.get("imagePublicId")) ?? undefined,
  });
  const data = { name: input.name, slug: input.slug, status: input.status as ProductStatus, tagline: input.tagline || null, cardDescription: input.cardDescription || null, introduction: input.introduction || null, seoTitle: input.seoTitle || null, seoDescription: input.seoDescription || null };
  const product = input.id ? await prisma.product.update({ where: { id: input.id }, data }) : await prisma.product.create({ data: { ...data, sortOrder: await prisma.product.count() } });
  if (input.imageUrl) {
    const card = await prisma.productMedia.findFirst({ where: { productId: product.id, kind: ProductMediaKind.CARD } });
    const media = { url: input.imageUrl, cloudinaryPublicId: input.imagePublicId || null, alt: `${product.name} product image`, sortOrder: 0 };
    if (card) await prisma.productMedia.update({ where: { id: card.id }, data: media });
    else await prisma.productMedia.create({ data: { productId: product.id, kind: ProductMediaKind.CARD, ...media } });
  }
  revalidatePath("/"); revalidatePath("/admin");
}

export async function updateLead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const internalNotes = nullable(formData.get("internalNotes"));
  if (!Object.values(LeadStatus).includes(status as LeadStatus)) throw new Error("Invalid lead status.");
  await prisma.lead.update({ where: { id }, data: { status: status as LeadStatus, internalNotes } });
  revalidatePath("/admin");
}
