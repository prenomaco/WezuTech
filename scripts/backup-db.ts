import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

/**
 * A full JSON snapshot of every table, written to `.backups/<timestamp>/`.
 *
 * JSON rather than `pg_dump` because the Postgres client tools are not
 * installed here, and because a per-table JSON export is restorable through
 * Prisma itself — see `scripts/restore-db.ts`. The directory is gitignored:
 * the `Lead` table holds names and email addresses.
 *
 * Run before anything that rewrites data: `npm run db:backup`.
 */
const prisma = new PrismaClient();

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(".backups", stamp);
  await mkdir(dir, { recursive: true });

  const tables = {
    user: await prisma.user.findMany(),
    product: await prisma.product.findMany(),
    productMedia: await prisma.productMedia.findMany(),
    productSection: await prisma.productSection.findMany(),
    category: await prisma.category.findMany(),
    productCategory: await prisma.productCategory.findMany(),
    lead: await prisma.lead.findMany(),
    testimonial: await prisma.testimonial.findMany(),
  };

  for (const [name, rows] of Object.entries(tables)) {
    await writeFile(path.join(dir, `${name}.json`), JSON.stringify(rows, null, 2));
    console.log(`  ${name}: ${rows.length} rows`);
  }

  await writeFile(
    path.join(dir, "manifest.json"),
    JSON.stringify(
      {
        takenAt: new Date().toISOString(),
        counts: Object.fromEntries(Object.entries(tables).map(([name, rows]) => [name, rows.length])),
      },
      null,
      2,
    ),
  );

  console.log(`\nSnapshot written to ${dir}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
