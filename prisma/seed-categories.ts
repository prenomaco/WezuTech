import { PrismaClient } from "@prisma/client";
import { writeCategories } from "./categories";

/** `npm run db:categories` — seeds the six categories and tags the catalogue. */
const prisma = new PrismaClient();

writeCategories(prisma, (line) => console.log(line))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
