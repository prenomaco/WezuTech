import type { Testimonial as TestimonialRecord } from "@prisma/client";
import { prisma } from "@/lib/db";

export type PublicTestimonial = Pick<TestimonialRecord, "id" | "lead" | "quote" | "client" | "title">;

export async function getPublishedTestimonials(): Promise<PublicTestimonial[]> {
  try {
    return await prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, lead: true, quote: true, client: true, title: true },
    });
  } catch {
    return [];
  }
}
