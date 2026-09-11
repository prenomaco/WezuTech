import Link from "next/link";
import { Inbox, MessageSquareQuote, Package, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { LEAD_STATUS_TONE, StatusText } from "@/components/dashboard/status-text";
import { Card, CardContent, CardHeader, CardTitle, Table, Td, Th } from "@/components/dashboard/ui";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const RECEIVED = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/**
 * A single number with its label, as the top row of the dashboard.
 *
 * Each one links to the page it summarises: a count is a question ("four new
 * enquiries?") and the answer is one route away, so the tile should be the
 * way there rather than something to read and then navigate past.
 */
function Stat({
  label,
  value,
  href,
  hint,
  icon: Icon,
}: {
  readonly label: string;
  readonly value: number;
  readonly href: string;
  readonly hint?: string;
  readonly icon: typeof Inbox;
}) {
  return (
    <Link
      className="rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-[var(--dash-primary)] focus-visible:outline-none"
      href={href}
    >
      <Card className="h-full transition-colors hover:border-[var(--dash-border-strong)] hover:bg-[var(--dash-card-hover)]">
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="font-medium text-[var(--dash-muted)]">{label}</CardTitle>
          <Icon aria-hidden className="size-4 text-[var(--dash-muted)]" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums text-[var(--dash-fg)]">{value}</p>
          {hint ? <p className="mt-1 text-xs text-[var(--dash-muted)]">{hint}</p> : null}
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function OverviewPage() {
  const [leadCount, newLeads, productCount, publishedCount, testimonialCount, recent] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.product.count(),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.testimonial.count({ where: { isPublished: true } }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, name: true, email: true, subject: true, status: true, createdAt: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader description="Everything the site is currently serving, at a glance." title="Overview" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          hint={newLeads ? `${newLeads} still new` : "All triaged"}
          href="/admin/leads"
          icon={Inbox}
          label="Enquiries"
          value={leadCount}
        />
        <Stat
          hint={`${publishedCount} published`}
          href="/admin/products"
          icon={Package}
          label="Products"
          value={productCount}
        />
        <Stat
          hint="Live on the site"
          href="/admin/testimonials"
          icon={MessageSquareQuote}
          label="Testimonials"
          value={testimonialCount}
        />
        <Stat hint="Application areas" href="/products" icon={Sparkles} label="Categories" value={6} />
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
                  <Th className="hidden sm:table-cell">Subject</Th>
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
                    <Td className="hidden text-[var(--dash-muted)] sm:table-cell">{lead.subject ?? "—"}</Td>
                    <Td>
                      <StatusText tone={LEAD_STATUS_TONE[lead.status]}>{lead.status}</StatusText>
                    </Td>
                    <Td className="text-right text-xs whitespace-nowrap text-[var(--dash-muted)]">
                      {RECEIVED.format(lead.createdAt)}
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
