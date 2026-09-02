import { NextResponse } from "next/server";
import { LeadEmailStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { notifySales } from "@/lib/email";
import { contactSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const result = contactSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Please complete the required fields correctly." }, { status: 400 });
  if (result.data.website) return NextResponse.json({ ok: true });

  try {
    const product = result.data.productSlug
      ? await prisma.product.findUnique({ where: { slug: result.data.productSlug }, select: { id: true } })
      : null;
    const lead = await prisma.lead.create({
      data: {
        name: result.data.name,
        email: result.data.email.toLowerCase(),
        phone: result.data.phone || null,
        company: result.data.company || null,
        subject: result.data.subject,
        message: result.data.message,
        sourceProductId: product?.id,
      },
    });
    const delivery = await notifySales(lead);
    await prisma.lead.update({
      where: { id: lead.id },
      data: { notificationStatus: delivery.status as LeadEmailStatus, notificationMessage: delivery.message },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "We could not send your message. Please try again shortly." }, { status: 503 });
  }
}
