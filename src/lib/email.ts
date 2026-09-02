import { Resend } from "resend";
import { env } from "@/lib/env";

type LeadMail = { id: string; name: string; email: string; subject: string | null; message: string; phone: string | null; company: string | null };

export async function notifySales(lead: LeadMail) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL || !env.CONTACT_RECIPIENT_EMAIL) {
    return { status: "SKIPPED" as const, message: "Resend is not configured." };
  }
  try {
    const resend = new Resend(env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: env.CONTACT_RECIPIENT_EMAIL,
      replyTo: lead.email,
      subject: `[Wezu enquiry] ${lead.subject ?? "New website contact"}`,
      text: `New potential client\n\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone ?? "—"}\nCompany: ${lead.company ?? "—"}\n\n${lead.message}\n\nLead ID: ${lead.id}`,
    });
    if (result.error) return { status: "FAILED" as const, message: result.error.message };
    return { status: "SENT" as const, message: result.data?.id ?? "Sent" };
  } catch (error) {
    return { status: "FAILED" as const, message: error instanceof Error ? error.message : "Unknown Resend error" };
  }
}
