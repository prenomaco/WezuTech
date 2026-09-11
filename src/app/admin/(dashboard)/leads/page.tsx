import { LeadsTable, type LeadRow } from "@/components/dashboard/leads-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { prisma } from "@/lib/db";

export const metadata = { title: "Enquiries" };
export const dynamic = "force-dynamic";

/**
 * Dates are formatted on the server and sent as strings.
 *
 * `toLocaleString()` in the browser runs against the visitor's locale while
 * the server-rendered markup used the server's, which React flags as a
 * hydration mismatch. One fixed format, chosen here, is the same in both.
 */
const RECEIVED = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    include: { sourceProduct: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const rows: LeadRow[] = leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    subject: lead.subject,
    message: lead.message,
    status: lead.status,
    internalNotes: lead.internalNotes,
    receivedAt: RECEIVED.format(lead.createdAt),
    productName: lead.sourceProduct?.name ?? null,
  }));

  const newCount = rows.filter((lead) => lead.status === "NEW").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description={
          newCount
            ? `${newCount} of ${rows.length} still marked new. Newest first.`
            : "Everything submitted through the contact form, newest first."
        }
        title="Enquiries"
      />

      <LeadsTable leads={rows} />
    </div>
  );
}
