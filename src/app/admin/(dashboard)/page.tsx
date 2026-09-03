import Link from "next/link";
import { Inbox, Package, Send, Users } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  Td,
  Th,
} from "@/components/dashboard/ui";
import { LEAD_TONE } from "@/components/dashboard/lead-status";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** A single number with its label, as the top row of the dashboard. */
function Stat({
  label,
  value,
  icon: Icon,
}: {
  readonly label: string;
  readonly value: number;
  readonly icon: typeof Inbox;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-[var(--dash-muted)] font-medium">{label}</CardTitle>
        <Icon aria-hidden className="size-4 text-[var(--dash-muted)]" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

export default async function OverviewPage() {
  const [leadCount, newLeads, productCount, publishedCount, recent] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.product.count(),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, name: true, email: true, subject: true, status: true, createdAt: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Inbox} label="Enquiries" value={leadCount} />
        <Stat icon={Send} label="New" value={newLeads} />
        <Stat icon={Package} label="Products" value={productCount} />
        <Stat icon={Users} label="Published" value={publishedCount} />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent enquiries</CardTitle>
          <Link className="text-sm text-[var(--dash-primary)] hover:underline" href="/admin/leads">
            View all
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length ? (
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Subject</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Received</Th>
                </tr>
              </thead>
              <tbody>
                {recent.map((lead) => (
                  <tr key={lead.id}>
                    <Td>
                      <span className="font-medium">{lead.name}</span>
                      <span className="block text-xs text-[var(--dash-muted)]">{lead.email}</span>
                    </Td>
                    <Td className="text-[var(--dash-muted)]">{lead.subject ?? "—"}</Td>
                    <Td>
                      <Badge tone={LEAD_TONE[lead.status]}>{lead.status}</Badge>
                    </Td>
                    <Td className="text-right text-xs whitespace-nowrap text-[var(--dash-muted)]">
                      {lead.createdAt.toLocaleDateString()}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="px-5 pb-5 text-sm text-[var(--dash-muted)]">No enquiries yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
