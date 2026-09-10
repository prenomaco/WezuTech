import { Resend } from "resend";
import { env } from "@/lib/env";
import { type LeadMail, leadEmailHtml, leadEmailSubject, leadEmailText } from "@/lib/lead-email";

export type { LeadMail };

/**
 * One notification, two audiences.
 *
 * The sales inbox is the recipient and the enquirer is on Cc, so the same
 * message both files the lead and confirms to the sender that it arrived —
 * instead of an internal alert plus a separate autoresponder that can drift
 * apart. `replyTo` therefore carries both addresses: a plain Reply from either
 * side lands on the other, and the thread stays one thread.
 */
export async function notifySales(lead: LeadMail) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL || !env.CONTACT_RECIPIENT_EMAIL) {
    return { status: "SKIPPED" as const, message: "Resend is not configured." };
  }
  try {
    const resend = new Resend(env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: env.CONTACT_RECIPIENT_EMAIL,
      cc: lead.email,
      replyTo: [env.CONTACT_RECIPIENT_EMAIL, lead.email],
      subject: leadEmailSubject(lead),
      html: leadEmailHtml(lead),
      /* Sent alongside the HTML, not instead of it: the plain part is what
         text-only clients and most spam filters actually read. */
      text: leadEmailText(lead),
    });
    if (result.error) return { status: "FAILED" as const, message: result.error.message };
    return { status: "SENT" as const, message: result.data?.id ?? "Sent" };
  } catch (error) {
    return { status: "FAILED" as const, message: error instanceof Error ? error.message : "Unknown Resend error" };
  }
}
