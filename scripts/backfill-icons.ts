import { ProductSectionType } from "@prisma/client";
import { prisma } from "../src/lib/db";
import { PORTFOLIO } from "../prisma/portfolio";
import { ICON_LIBRARY, canonicalIconKey } from "../src/lib/icon-library";

/**
 * Fills in the icon key on every stored feature, and rewrites category icons
 * to the names the Phosphor library uses.
 *
 * Both fields previously held a Lucide key or nothing at all: a category's
 * icon was chosen from fifteen glyphs, and a feature had no icon field
 * because the product page drew six fixed marks by position. The reader maps
 * the old names, so this is not required for the site to render. It is here so
 * the stored data says what the dashboard now shows, rather than relying on a
 * compatibility shim forever.
 *
 * Matching is by feature title against `prisma/portfolio.ts`, which is the
 * catalogue's own definition. A feature that is not in there (added or renamed
 * in the dashboard) is left alone rather than guessed at, and reported.
 *
 * Safe to re-run: it only writes a row whose value would change.
 */
const FEATURE_ICONS = new Map(
  PORTFOLIO.flatMap((product) =>
    product.features.map((feature) => [`${product.slug}::${feature.title}`, feature.icon] as const),
  ),
);

interface FeatureItem {
  readonly title?: unknown;
  readonly icon?: unknown;
}

async function backfillFeatures() {
  const sections = await prisma.productSection.findMany({
    where: { type: ProductSectionType.FEATURES },
    select: { id: true, data: true, product: { select: { slug: true, name: true } } },
  });

  let updated = 0;
  const unmatched: string[] = [];

  for (const section of sections) {
    const source = Array.isArray(section.data)
      ? section.data
      : (section.data as { items?: unknown } | null)?.items;
    if (!Array.isArray(source)) continue;

    let changed = false;
    const items = source.map((entry) => {
      const item = (entry && typeof entry === "object" ? entry : {}) as FeatureItem;
      const title = String(item.title ?? "");
      const wanted = FEATURE_ICONS.get(`${section.product.slug}::${title}`);
      if (!wanted) {
        if (!item.icon) unmatched.push(`${section.product.slug} / ${title || "(untitled)"}`);
        return item;
      }
      if (item.icon === wanted) return item;
      changed = true;
      return { ...item, icon: wanted };
    });

    if (!changed) continue;
    await prisma.productSection.update({ where: { id: section.id }, data: { data: { items } } });
    updated += 1;
    console.log(`  ${section.product.name}: ${items.length} feature icons set`);
  }

  console.log(`Feature sections updated: ${updated} of ${sections.length}`);
  if (unmatched.length) {
    console.log("Left without an icon (not in prisma/portfolio.ts):");
    for (const line of unmatched) console.log(`  ${line}`);
  }
}

async function backfillCategories() {
  const categories = await prisma.category.findMany({ select: { id: true, name: true, icon: true } });
  let updated = 0;

  for (const category of categories) {
    const canonical = canonicalIconKey(category.icon);
    if (canonical === category.icon) continue;
    await prisma.category.update({ where: { id: category.id }, data: { icon: canonical } });
    updated += 1;
    console.log(`  ${category.name}: ${category.icon} -> ${canonical} (${ICON_LIBRARY[canonical].label})`);
  }

  console.log(`Category icons rewritten: ${updated} of ${categories.length}`);
}

async function main() {
  await backfillFeatures();
  await backfillCategories();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
