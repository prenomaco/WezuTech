import { updateLead } from "@/app/admin/actions";
import { LEAD_STATUSES, LEAD_TONE } from "@/components/dashboard/lead-status";
import { Badge, Button, Card, CardContent, Select, Table, Td, Textarea, Th } from "@/components/dashboard/ui";
import { prisma } from "@/lib/db";

export const metadata = { title: "Enquiries" };
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    include: { sourceProduct: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl text-[var(--dash-fg)]">Enquiries</h2>
        <p className="text-sm text-[var(--dash-muted)]">
          Everything submitted through the contact form, newest first.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {leads.length ? (
            <Table>
              <thead>
                <tr>
                  <Th>From</Th>
                  <Th>Message</Th>
                  <Th className="w-56">Status</Th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <Td className="whitespace-nowrap">
                      <span className="font-medium">{lead.name}</span>
                      <span className="block text-xs text-[var(--dash-muted)]">{lead.email}</span>
                      {lead.company ? (
                        <span className="block text-xs text-[var(--dash-muted)]">{lead.company}</span>
                      ) : null}
                      <span className="mt-1 block text-xs text-[var(--dash-muted)]">
                        {lead.createdAt.toLocaleString()}
                      </span>
                    </Td>

                    <Td className="min-w-[18rem]">
                      {lead.subject ? <p className="font-medium">{lead.subject}</p> : null}
                      <p className="text-[var(--dash-muted)]">{lead.message}</p>
                      {lead.sourceProduct ? (
                        <p className="mt-1 text-xs text-[var(--dash-muted)]">
                          About {lead.sourceProduct.name}
                        </p>
                      ) : null}
                    </Td>

                    <Td>
                      <div className="mb-2">
                        <Badge tone={LEAD_TONE[lead.status]}>{lead.status}</Badge>
                      </div>
                      <form action={updateLead} className="flex flex-col gap-2">
                        <input name="id" type="hidden" value={lead.id} />
                        <Select defaultValue={lead.status} name="status">
                          {LEAD_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </Select>
                        <Textarea
                          defaultValue={lead.internalNotes ?? ""}
                          name="internalNotes"
                          placeholder="Internal notes"
                        />
                        <Button size="sm" type="submit">
                          Save
                        </Button>
                      </form>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="p-5 text-sm text-[var(--dash-muted)]">No enquiries yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
