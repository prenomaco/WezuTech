"use server";

import { compare, hash } from "bcryptjs";
import { LeadStatus, ProductMediaKind, ProductSectionType, ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { categoryPath, getCategorySlugs } from "@/lib/categories";
import { categoryInputSchema, productInputSchema, testimonialInputSchema } from "@/lib/validation";

const BCRYPT_ROUNDS = 12;
const productIdSchema = z.string().cuid();

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
    heroUrl: nullable(formData.get("heroUrl")) ?? undefined, heroUrlPublicId: nullable(formData.get("heroUrlPublicId")) ?? undefined,
    detailUrl: nullable(formData.get("detailUrl")) ?? undefined, detailUrlPublicId: nullable(formData.get("detailUrlPublicId")) ?? undefined,
    gallery: json(formData.get("gallery")),
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
    /* `getAll`: the picker is a checkbox group, so an unchecked box sends
       nothing and several checked boxes send the same name repeatedly. */
    categorySlugs: formData.getAll("categorySlugs").map(String),
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
      /*
       * No CARD row is written any more. The catalogue card shows the hero
       * image, so a separate "carousel card image" was a second picture to
       * keep in step with the first, and the seeded kiosk proved the point by
       * shipping a compressor drawing on its card and the actual charger only
       * on its page. The kind is still deleted above, which retires any row
       * left over from that field.
       */
      [ProductMediaKind.HERO, input.heroUrl, input.heroUrlPublicId, 0, `${saved.name} hero image`],
      [ProductMediaKind.DETAIL, input.detailUrl, input.detailUrlPublicId, 0, `${saved.name} detail image`],
      [ProductMediaKind.APPLICATION, input.applicationOneUrl, input.applicationOneUrlPublicId, 0, `${saved.name} application 1`],
      [ProductMediaKind.APPLICATION, input.applicationTwoUrl, input.applicationTwoUrlPublicId, 1, `${saved.name} application 2`],
      [ProductMediaKind.APPLICATION, input.applicationThreeUrl, input.applicationThreeUrlPublicId, 2, `${saved.name} application 3`],
      [ProductMediaKind.DATASHEET, input.datasheetUrl, input.datasheetUrlPublicId, 0, `${saved.name} datasheet`],
    ] as const;
    const present = media.filter((entry): entry is typeof entry & readonly [ProductMediaKind, string, string | undefined, number, string] => Boolean(entry[1]));
    if (present.length) await tx.productMedia.createMany({ data: present.map(([kind, url, publicId, sortOrder, alt]) => ({ productId: saved.id, kind, url, cloudinaryPublicId: publicId || null, sortOrder, alt })) });

    /* The gallery, in the order the editor arranged it. */
    if (input.gallery.length) {
      await tx.productMedia.createMany({
        data: input.gallery.map((image, index) => ({
          productId: saved.id,
          kind: ProductMediaKind.GALLERY,
          url: image.url,
          cloudinaryPublicId: image.publicId || null,
          sortOrder: index,
          alt: `${saved.name} view ${index + 2}`,
        })),
      });
    }

    /* Replaced wholesale, like the sections above: the form posts the complete
       set of ticked boxes, so a category that is absent from the payload is
       one the editor has just cleared. Unknown slugs are dropped rather than
       throwing — the six are defined in code, and a stale form should not be
       able to create a seventh. */
    await tx.productCategory.deleteMany({ where: { productId: saved.id } });
    const categories = await tx.category.findMany({
      where: { slug: { in: input.categorySlugs } },
      select: { id: true, slug: true },
    });
    if (categories.length) {
      await tx.productCategory.createMany({
        data: categories.map((category, sortOrder) => ({ productId: saved.id, categoryId: category.id, sortOrder })),
      });
    }
    return saved;
  });
  await revalidateCatalogue(product.slug, oldSlug);
  /* Back to the index: the form is a page now, so saving has somewhere to go
     and "did that save?" is answered by the row being right. */
  redirect("/admin/products");
}

/**
 * Every public surface a product appears on.
 *
 * The catalogue index and the six category pages are included because a
 * product's categories are editable: publishing one into Marine has to make
 * it appear on `/products/category/marine`, not on that page's next
 * 60-second revalidation.
 */
async function revalidateCatalogue(slug: string, oldSlug?: string) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath(`/products/${slug}`);
  if (oldSlug && oldSlug !== slug) revalidatePath(`/products/${oldSlug}`);
  for (const categorySlug of await getCategorySlugs()) revalidatePath(categoryPath(categorySlug));
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = productIdSchema.parse(formData.get("id"));
  const product = await prisma.product.findUniqueOrThrow({ where: { id }, select: { slug: true } });

  await prisma.product.delete({ where: { id } });
  await revalidateCatalogue(product.slug);
}

/**
 * Creates or updates a product family.
 *
 * The slug is what every public URL is built from, so changing it has to
 * revalidate the old path as well as the new one — otherwise the renamed
 * category keeps serving from its previous address until the cache expires.
 */
export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const input = categoryInputSchema.parse({
    id: nullable(formData.get("id")) ?? undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    blurb: formData.get("blurb"),
    image: nullable(formData.get("image")) ?? undefined,
    imagePublicId: nullable(formData.get("imagePublicId")) ?? undefined,
    icon: formData.get("icon"),
    sortOrder: formData.get("sortOrder"),
  });

  const previousSlug = input.id
    ? (await prisma.category.findUnique({ where: { id: input.id }, select: { slug: true } }))?.slug
    : undefined;

  const data = {
    name: input.name,
    slug: input.slug,
    blurb: input.blurb,
    image: input.image || null,
    imagePublicId: input.imagePublicId || null,
    icon: input.icon,
    sortOrder: input.sortOrder,
  };

  if (input.id) await prisma.category.update({ where: { id: input.id }, data });
  else await prisma.category.create({ data });

  await revalidateCategories(previousSlug);
  redirect("/admin/categories");
}

/**
 * Deletes a family. Its `ProductCategory` rows go with it through the
 * schema's cascade, so the products themselves are untouched — they simply
 * stop being filed under it.
 */
export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = z.string().cuid().parse(formData.get("id"));
  const category = await prisma.category.findUniqueOrThrow({ where: { id }, select: { slug: true } });
  await prisma.category.delete({ where: { id } });
  await revalidateCategories(category.slug);
}

/** Every surface a category appears on, plus a slug that has just stopped existing. */
async function revalidateCategories(goneSlug?: string) {
  revalidatePath("/products");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  /*
   * The product form, too.
   *
   * Its category picker is built from these rows, and the form is a separate
   * route from the list. Without these two the picker could keep offering the
   * old set: the pages are `force-dynamic`, but the client router may reuse a
   * recently visited one for `staleTimes.dynamic` (30s), so a category added
   * and then immediately assigned would not be there to tick.
   */
  revalidatePath("/admin/products/new");
  revalidatePath("/admin/products/[id]/edit", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/products/category/[category]", "page");
  for (const slug of await getCategorySlugs()) revalidatePath(categoryPath(slug));
  if (goneSlug) revalidatePath(categoryPath(goneSlug));
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
  /* As with products: the form is its own page, so saving returns to the list
     where the change is visible. */
  redirect("/admin/testimonials");
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
