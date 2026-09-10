import { hash } from "bcryptjs";
import { ProductStatus } from "@prisma/client";
import { prisma } from "../src/lib/db";
import { writePortfolio } from "./portfolio";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD are required to seed the first admin.");

  await prisma.user.upsert({ where: { email }, update: { passwordHash: await hash(password, 12), isActive: true }, create: { email, passwordHash: await hash(password, 12), role: "ADMIN" } });

  /* The catalogue lives in `portfolio.ts` so that this file and
     `seed-portfolio.ts` cannot drift apart or revert one another. A first run
     publishes it; after that, `npm run db:portfolio` is the way to write
     product changes without also resetting the admin password below. */
  await writePortfolio(ProductStatus.PUBLISHED, (line) => console.log(line));

  const testimonials = [
    ["seed-testimonial-1", "Wezu Technologies", " has consistently provided innovative solutions for our automotive projects. Their ability to understand our requirements and translate them into practical designs is remarkable. We were impressed by their commitment to quality and attention to detail throughout the process.", "Automotive OEM Client", "Exceptional Innovation and Service", 0],
    ["seed-testimonial-2", null, "The team combined strong engineering knowledge with a clear understanding of production constraints. Their responsive approach helped us move from concept to a dependable solution without losing momentum.", "Mobility Systems Partner", "Practical Expertise, Delivered", 1],
    ["seed-testimonial-3", null, "Wezu brought real clarity to a complex electrification programme. The hardware and software thinking felt connected from day one, and every milestone was handled with care.", "Electric Vehicle Manufacturer", "A Trusted Development Partner", 2],
    ["seed-testimonial-4", null, "Their focus on reliability, communication, and testing made a meaningful difference to our launch. We value the partnership and the confidence their work gives our operations team.", "Industrial Fleet Operator", "Reliability at Every Stage", 3],
    ["seed-testimonial-5", null, "They treated our requirements as engineering problems rather than a specification to sign off. The result is a platform we can keep building on, and a team we would work with again.", "Commercial Vehicle Group", "Built to Keep Developing", 4],
  ] as const;
  for (const [id, lead, quote, client, title, sortOrder] of testimonials) await prisma.testimonial.upsert({ where: { id }, update: { lead, quote, client, title, sortOrder, isPublished: true }, create: { id, lead, quote, client, title, sortOrder, isPublished: true } });
}

main().finally(async () => prisma.$disconnect());
