"use server";

import { compare, hash } from "bcryptjs";
import { LeadStatus, ProductMediaKind, ProductSectionType, ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { productInputSchema, testimonialInputSchema } from "@/lib/validation";

const BCRYPT_ROUNDS = 12;

const nullable = (value: FormDataEntryValue | null) => typeof value === "string" && value.trim() ? value.trim() : null;
const json = (value: FormDataEntryValue | null) => JSON.parse(typeof value === "string" && value ? value : "[]") as unknown;

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const input = productInputSchema.parse({
    id: nullable(formData.get("id")) ?? undefined,
    name: formData.get("name"), slug: formData.get("slug"), status: formData.get("status"), sortOrder: formData.get("sortOrder"),
    tagline: nullable(formData.get("tagline")) ?? undefined, cardDescription: nullable(formData.get("cardDescription")) ?? undefined,
    introduction: nullable(formData.get("introduction")) ?? undefined, seoTitle: nullable(formData.get("seoTitle")) ?? undefined,
    seoDescription: nullable(formData.get("seoDescription")) ?? undefined,
    cardUrl: nullable(formData.get("cardUrl")) ?? undefined, cardUrlPublicId: nullable(formData.get("cardUrlPublicId")) ?? undefined,
    heroUrl: nullable(formData.get("heroUrl")) ?? undefined, heroUrlPublicId: nullable(formData.get("heroUrlPublicId")) ?? undefined,
    detailUrl: nullable(formData.get("detailUrl")) ?? undefined, detailUrlPublicId: nullable(formData.get("detailUrlPublicId")) ?? undefined,
    galleryOneUrl: nullable(formData.get("galleryOneUrl")) ?? undefined, galleryOneUrlPublicId: nullable(formData.get("galleryOneUrlPublicId")) ?? undefined,
    galleryTwoUrl: nullable(formData.get("galleryTwoUrl")) ?? undefined, galleryTwoUrlPublicId: nullable(formData.get("galleryTwoUrlPublicId")) ?? undefined,
    applicationOneUrl: nullable(formData.get("applicationOneUrl")) ?? undefined, applicationOneUrlPublicId: nullable(formData.get("applicationOneUrlPublicId")) ?? undefined,
    applicationTwoUrl: nullable(formData.get("applicationTwoUrl")) ?? undefined, applicationTwoUrlPublicId: nullable(formData.get("applicationTwoUrlPublicId")) ?? undefined,
    applicationThreeUrl: nullable(formData.get("applicationThreeUrl")) ?? undefined, applicationThreeUrlPublicId: nullable(formData.get("applicationThreeUrlPublicId")) ?? undefined,
    datasheetUrl: nullable(formData.get("datasheetUrl")) ?? undefined, datasheetUrlPublicId: nullable(formData.get("datasheetUrlPublicId")) ?? undefined,
    metricsTitle: nullable(formData.get("metricsTitle")) ?? undefined, metrics: json(formData.get("metrics")),
    overviewTitle: nullable(formData.get("overviewTitle")) ?? undefined, overviewIntro: nullable(formData.get("overviewIntro")) ?? undefined,
    overviewItems: json(formData.get("overviewItems")), featuresTitle: nullable(formData.get("featuresTitle")) ?? undefined,
    features: json(formData.get("features")), applicationsTitle: nullable(formData.get("applicationsTitle")) ?? undefined,
    applications: json(formData.get("applications")), specificationsTitle: nullable(formData.get("specificationsTitle")) ?? undefined,
    specifications: json(formData.get("specifications")), specificationsNote: nullable(formData.get("specificationsNote")) ?? undefined,
    cta: { quoteLabel: formData.get("quoteLabel"), datasheetLabel: formData.get("datasheetLabel") },
  });
  const oldSlug = input.id ? (await prisma.product.findUnique({ where: { id: input.id }, select: { slug: true } }))?.slug : undefined;
  const product = await prisma.$transaction(async (tx) => {
    const data = { name: input.name, slug: input.slug, status: input.status as ProductStatus, sortOrder: input.sortOrder, tagline: input.tagline || null, cardDescription: input.cardDescription || null, introduction: input.introduction || null, seoTitle: input.seoTitle || null, seoDescription: input.seoDescription || null };
    const saved = input.id ? await tx.product.update({ where: { id: input.id }, data }) : await tx.product.create({ data });

    await tx.productSection.deleteMany({ where: { productId: saved.id, type: { in: [ProductSectionType.METRICS, ProductSectionType.BENEFITS, ProductSectionType.FEATURES, ProductSectionType.ENVIRONMENTS, ProductSectionType.SPECIFICATIONS, ProductSectionType.CTA] } } });
    await tx.productSection.createMany({ data: [
      { productId: saved.id, type: ProductSectionType.METRICS, title: input.metricsTitle || null, sortOrder: 1, data: { items: input.metrics } },
      { productId: saved.id, type: ProductSectionType.BENEFITS, title: input.overviewTitle || null, sortOrder: 2, data: { intro: input.overviewIntro ?? "", items: input.overviewItems } },
      { productId: saved.id, type: ProductSectionType.FEATURES, title: input.featuresTitle || "Key Features", sortOrder: 3, data: { items: input.features } },
      { productId: saved.id, type: ProductSectionType.ENVIRONMENTS, title: input.applicationsTitle || "Applications", sortOrder: 4, data: { items: input.applications } },
      { productId: saved.id, type: ProductSectionType.SPECIFICATIONS, title: input.specificationsTitle || "Technical Specifications", sortOrder: 5, data: { items: input.specifications, note: input.specificationsNote ?? "" } },
      { productId: saved.id, type: ProductSectionType.CTA, sortOrder: 6, data: input.cta },
    ] });

    await tx.productMedia.deleteMany({ where: { productId: saved.id, kind: { in: [ProductMediaKind.CARD, ProductMediaKind.HERO, ProductMediaKind.DETAIL, ProductMediaKind.GALLERY, ProductMediaKind.APPLICATION, ProductMediaKind.DATASHEET] } } });
    const media = [
      [ProductMediaKind.CARD, input.cardUrl, input.cardUrlPublicId, 0, `${saved.name} catalogue image`],
      [ProductMediaKind.HERO, input.heroUrl, input.heroUrlPublicId, 0, `${saved.name} hero image`],
      [ProductMediaKind.DETAIL, input.detailUrl, input.detailUrlPublicId, 0, `${saved.name} detail image`],
      [ProductMediaKind.GALLERY, input.galleryOneUrl, input.galleryOneUrlPublicId, 0, `${saved.name} alternate view 1`],
      [ProductMediaKind.GALLERY, input.galleryTwoUrl, input.galleryTwoUrlPublicId, 1, `${saved.name} alternate view 2`],
      [ProductMediaKind.APPLICATION, input.applicationOneUrl, input.applicationOneUrlPublicId, 0, `${saved.name} application 1`],
      [ProductMediaKind.APPLICATION, input.applicationTwoUrl, input.applicationTwoUrlPublicId, 1, `${saved.name} application 2`],
      [ProductMediaKind.APPLICATION, input.applicationThreeUrl, input.applicationThreeUrlPublicId, 2, `${saved.name} application 3`],
      [ProductMediaKind.DATASHEET, input.datasheetUrl, input.datasheetUrlPublicId, 0, `${saved.name} datasheet`],
    ] as const;
    const present = media.filter((entry): entry is typeof entry & readonly [ProductMediaKind, string, string | undefined, number, string] => Boolean(entry[1]));
    if (present.length) await tx.productMedia.createMany({ data: present.map(([kind, url, publicId, sortOrder, alt]) => ({ productId: saved.id, kind, url, cloudinaryPublicId: publicId || null, sortOrder, alt })) });
    return saved;
  });
  revalidatePath("/"); revalidatePath("/admin"); revalidatePath("/admin/products");
  revalidatePath(`/products/${product.slug}`);
  if (oldSlug && oldSlug !== product.slug) revalidatePath(`/products/${oldSlug}`);
}

export async function saveTestimonial(formData: FormData) {
  await requireAdmin();
  const input = testimonialInputSchema.parse({
    id: nullable(formData.get("id")) ?? undefined,
    lead: nullable(formData.get("lead")) ?? undefined,
    quote: formData.get("quote"), client: formData.get("client"), title: formData.get("title"),
    isPublished: formData.get("isPublished") === "on", sortOrder: formData.get("sortOrder"),
  });
  const data = { lead: input.lead || null, quote: input.quote, client: input.client, title: input.title, isPublished: input.isPublished, sortOrder: input.sortOrder };
  if (input.id) await prisma.testimonial.update({ where: { id: input.id }, data });
  else await prisma.testimonial.create({ data });
  revalidatePath("/"); revalidatePath("/about"); revalidatePath("/admin/testimonials");
}

export async function deleteTestimonial(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Testimonial id is required.");
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/"); revalidatePath("/about"); revalidatePath("/admin/testimonials");
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

/**
 * Called directly (not via `<form action>`) so the settings dialog can show
 * its error inline without leaving the page — the return value is the whole
 * point, which a form submission's navigation would otherwise discard.
 */
export async function changePassword(formData: FormData): Promise<{ readonly error?: string }> {
  const admin = await requireAdmin();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) return { error: "New password must be at least 8 characters." };
  if (newPassword !== confirmPassword) return { error: "New passwords do not match." };

  const user = await prisma.user.findUnique({ where: { id: admin.id } });
  if (!user || !(await compare(currentPassword, user.passwordHash))) {
    return { error: "Current password is incorrect." };
  }
  if (await compare(newPassword, user.passwordHash)) {
    return { error: "New password must be different from the current one." };
  }

  const passwordHash = await hash(newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({ where: { id: admin.id }, data: { passwordHash } });
  return {};
}
