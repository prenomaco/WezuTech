import type { PrismaClient } from "@prisma/client";
import { PRODUCT_CATEGORIES } from "../src/lib/product-categories";

/**
 * The six categories, and the catalogue's opening assignment to them.
 *
 * Kept here rather than inside a seed script for the same reason
 * `portfolio.ts` exists: `seed.ts` and `seed-categories.ts` both need it, and
 * two copies would drift apart or revert one another.
 *
 * Both halves are idempotent. Categories are upserted by slug, so re-running
 * refreshes their copy from `lib/product-categories` without touching
 * anything else. Assignments are only written to a product that has none, so
 * a choice made in the dashboard is never undone by a seed.
 *
 * The mapping below is a starting point, not a claim: every one of these
 * products is charging or storage hardware that genuinely serves several
 * areas, which is why the relation is many-to-many. The dashboard is where it
 * gets corrected.
 */
const ASSIGNMENTS: Readonly<Record<string, readonly string[]>> = {
  "public-kiosk-charger": ["automotive", "special-purpose-vehicles"],
  "multi-bike-charging-station": ["automotive", "special-purpose-vehicles"],
  "dc-fast-charging-station": ["automotive", "special-purpose-vehicles", "locomotive"],
  "mobility-battery-packs": ["automotive", "special-purpose-vehicles", "aerospace-uav"],
  "industrial-auxiliary-battery-packs": ["agriculture-mining", "marine", "locomotive"],
  "portable-medium-energy-storage": ["marine", "agriculture-mining", "aerospace-uav"],
  "large-load-balancing-energy-storage": ["locomotive", "agriculture-mining", "marine"],
};

export async function writeCategories(
  prisma: PrismaClient,
  log: (line: string) => void = () => {},
) {
  for (const [index, category] of PRODUCT_CATEGORIES.entries()) {
    const data = {
      name: category.title,
      blurb: category.body,
      image: category.image,
      sortOrder: index,
    };
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: { slug: category.slug, ...data },
      update: data,
    });
  }
  log(`Categories upserted: ${PRODUCT_CATEGORIES.length}`);

  const categoryIds = new Map(
    (await prisma.category.findMany({ select: { id: true, slug: true } })).map((row) => [row.slug, row.id]),
  );

  const products = await prisma.product.findMany({
    select: { id: true, slug: true, name: true, _count: { select: { categories: true } } },
  });

  let tagged = 0;
  for (const product of products) {
    if (product._count.categories > 0) continue;
    const slugs = ASSIGNMENTS[product.slug];
    if (!slugs) {
      log(`  no assignment for "${product.slug}" — left untagged`);
      continue;
    }
    await prisma.productCategory.createMany({
      data: slugs.flatMap((slug, sortOrder) => {
        const categoryId = categoryIds.get(slug);
        return categoryId ? [{ productId: product.id, categoryId, sortOrder }] : [];
      }),
      skipDuplicates: true,
    });
    tagged += 1;
    log(`  ${product.name} -> ${slugs.join(", ")}`);
  }
  log(`Products tagged: ${tagged} of ${products.length}`);
}
