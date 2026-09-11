import type { PrismaClient } from "@prisma/client";

/**
 * The product families the catalogue is filed under, and the catalogue's
 * opening assignment to them.
 *
 * These replaced a first attempt that reused the home page's industries
 * (Automotive, Marine, Locomotive and so on). That set describes the markets
 * Wezu sells into, not the things it sells, so every product had to be forced
 * into a vehicle category it only loosely belonged to and four of the six
 * pages would have stood nearly empty. The families below are what the
 * catalogue actually contains, plus the three capabilities the home page
 * already claims: thermal management, power electronics, diagnostics.
 *
 * This is a starting point, not a fixture. Categories are rows and the
 * dashboard edits them, so the client can rename, reorder, re-describe or
 * replace any of this without a deployment. The seed only fills in a product
 * that has no categories at all, so nothing chosen in the dashboard is ever
 * undone by re-running it.
 *
 * Copy here avoids em dashes deliberately: it is site copy, and the site does
 * not use them.
 */
interface SeedCategory {
  readonly slug: string;
  readonly name: string;
  readonly blurb: string;
  readonly icon: string;
}

export const SEED_CATEGORIES: readonly SeedCategory[] = [
  {
    slug: "ev-charging",
    name: "EV Charging",
    blurb:
      "AC and DC charging hardware for public, workplace and fleet sites, from compact wall kiosks up to high power corridor chargers.",
    icon: "plug-zap",
  },
  {
    slug: "battery-systems",
    name: "Battery Systems",
    blurb:
      "Lithium-ion packs and the management electronics around them, built for mobility duty cycles and for continuous industrial service.",
    icon: "battery-charging",
  },
  {
    slug: "energy-storage",
    name: "Energy Storage",
    blurb:
      "Storage that travels and storage that stays, from portable field units up to container class systems that balance load across a site.",
    icon: "container",
  },
  {
    slug: "thermal-management",
    name: "Thermal Management",
    blurb:
      "Cooling for batteries, motors and power electronics, so range, output and service life hold up under sustained load.",
    icon: "thermometer",
  },
  {
    slug: "power-electronics",
    name: "Power Electronics",
    blurb:
      "Conversion, distribution and protection along the whole power path, between a supply, a pack and the system being driven.",
    icon: "circuit-board",
  },
  {
    slug: "diagnostics-connectivity",
    name: "Diagnostics and Connectivity",
    blurb:
      "Monitoring, telemetry and fault detection, so a deployed system reports its own condition before it turns into a callout.",
    icon: "activity",
  },
];

/**
 * Which families each catalogue product belongs to.
 *
 * Several each, because that is how the hardware actually works: a DC fast
 * charger is charging equipment, it is power electronics, it is liquid cooled,
 * and it reports over the network. Filing it under one of those would make the
 * other three pages look emptier than the range really is.
 */
const ASSIGNMENTS: Readonly<Record<string, readonly string[]>> = {
  "public-kiosk-charger": ["ev-charging", "power-electronics", "diagnostics-connectivity"],
  "multi-bike-charging-station": ["ev-charging", "power-electronics", "diagnostics-connectivity"],
  "dc-fast-charging-station": [
    "ev-charging",
    "power-electronics",
    "thermal-management",
    "diagnostics-connectivity",
  ],
  "mobility-battery-packs": ["battery-systems", "thermal-management", "diagnostics-connectivity"],
  "industrial-auxiliary-battery-packs": [
    "battery-systems",
    "thermal-management",
    "diagnostics-connectivity",
  ],
  "portable-medium-energy-storage": ["energy-storage", "power-electronics", "battery-systems"],
  "large-load-balancing-energy-storage": [
    "energy-storage",
    "power-electronics",
    "thermal-management",
    "diagnostics-connectivity",
  ],
};

export async function writeCategories(
  prisma: PrismaClient,
  log: (line: string) => void = () => {},
) {
  for (const [index, category] of SEED_CATEGORIES.entries()) {
    const data = { name: category.name, blurb: category.blurb, icon: category.icon, sortOrder: index };
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: { slug: category.slug, ...data },
      update: data,
    });
  }
  log(`Categories upserted: ${SEED_CATEGORIES.length}`);

  /*
   * Anything not in the set above goes, along with its product links through
   * the schema's cascade. This is what retires the original vehicle
   * categories. A family added in the dashboard would be removed by this too,
   * which is why the seed is a setup step rather than something to run on a
   * whim.
   */
  const keep = SEED_CATEGORIES.map((category) => category.slug);
  const stale = await prisma.category.findMany({
    where: { slug: { notIn: keep } },
    select: { slug: true, name: true },
  });
  if (stale.length) {
    await prisma.category.deleteMany({ where: { slug: { notIn: keep } } });
    log(`Removed ${stale.length} category(ies) not in the seed: ${stale.map((row) => row.slug).join(", ")}`);
  }

  const categoryIds = new Map(
    (await prisma.category.findMany({ select: { id: true, slug: true } })).map((row) => [row.slug, row.id]),
  );

  /* After the deletion above, so a product whose only links were to retired
     categories counts as untagged and gets the new assignment. */
  const products = await prisma.product.findMany({
    select: { id: true, slug: true, name: true, _count: { select: { categories: true } } },
  });

  let tagged = 0;
  for (const product of products) {
    if (product._count.categories > 0) continue;
    const slugs = ASSIGNMENTS[product.slug];
    if (!slugs) {
      log(`  no assignment for "${product.slug}", left untagged`);
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
    log(`  ${product.name}: ${slugs.join(", ")}`);
  }
  log(`Products tagged: ${tagged} of ${products.length}`);
}
