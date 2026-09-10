import { ProductStatus } from "@prisma/client";
import { prisma } from "../src/lib/db";
import { PORTFOLIO, writePortfolio } from "./portfolio";

/**
 * Writes the catalogue in `portfolio.ts` and nothing else.
 *
 * Separate from `seed.ts` because that one also resets the admin password from
 * `ADMIN_INITIAL_PASSWORD` and rewrites the testimonials — fine on a first run,
 * not something to do to a live database because a product's copy changed.
 *
 *   npm run db:portfolio                              # writes as DRAFT
 *   PORTFOLIO_STATUS=PUBLISHED npm run db:portfolio   # writes as PUBLISHED
 *
 * DRAFT is the default: this table is the one the live site reads, so putting
 * a product in front of the public is the deliberate step.
 */
const status =
  process.env.PORTFOLIO_STATUS?.trim().toUpperCase() === "PUBLISHED"
    ? ProductStatus.PUBLISHED
    : ProductStatus.DRAFT;

async function main() {
  await writePortfolio(status, (line) => console.log(line));
  console.log(`\n${PORTFOLIO.length} products written as ${status}.`);
}

main().finally(async () => prisma.$disconnect());
