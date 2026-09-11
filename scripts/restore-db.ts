import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

/**
 * Restores a snapshot written by `scripts/backup-db.ts`.
 *
 * `npm run db:restore` takes the newest snapshot in `.backups/`, or
 * `npm run db:restore -- <folder>` a named one. Rows are upserted by id
 * rather than the tables being emptied first, so a restore repairs what the
 * snapshot covers and leaves anything created since alone — recovering a
 * botched reseed should not also delete an enquiry that arrived in the
 * meantime.
 *
 * Order matters: parents before the rows that reference them.
 */
const prisma = new PrismaClient();

async function newestSnapshot() {
  const entries = await readdir(".backups", { withFileTypes: true });
  const dirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  if (!dirs.length) throw new Error("No snapshots in .backups/. Run `npm run db:backup` first.");
  return dirs[dirs.length - 1];
}

async function rows<T>(dir: string, table: string): Promise<T[]> {
  return JSON.parse(await readFile(path.join(dir, `${table}.json`), "utf8")) as T[];
}

/** Dates come back from JSON as strings; Prisma wants Date objects. */
function revive<T extends Record<string, unknown>>(row: T): T {
  const out: Record<string, unknown> = { ...row };
  for (const [key, value] of Object.entries(out)) {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(value)) out[key] = new Date(value);
  }
  return out as T;
}

async function main() {
  const name = process.argv[2] ?? (await newestSnapshot());
  const dir = path.join(".backups", name);
  console.log(`Restoring from ${dir}\n`);

  const simple = [
    ["user", prisma.user],
    ["product", prisma.product],
    ["category", prisma.category],
    ["lead", prisma.lead],
    ["testimonial", prisma.testimonial],
    ["productMedia", prisma.productMedia],
    ["productSection", prisma.productSection],
  ] as const;

  for (const [table, model] of simple) {
    const data = (await rows<{ id: string }>(dir, table)).map(revive);
    for (const row of data) {
      // @ts-expect-error -- the delegates differ in shape; the id-keyed upsert is the same call.
      await model.upsert({ where: { id: row.id }, create: row, update: row });
    }
    console.log(`  ${table}: ${data.length} rows`);
  }

  /* Composite key, so it cannot be upserted by `id` like the rest. */
  const joins = (await rows<{ productId: string; categoryId: string; sortOrder: number }>(dir, "productCategory")).map(revive);
  for (const row of joins) {
    await prisma.productCategory.upsert({
      where: { productId_categoryId: { productId: row.productId, categoryId: row.categoryId } },
      create: row,
      update: row,
    });
  }
  console.log(`  productCategory: ${joins.length} rows`);
  console.log("\nRestore complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
