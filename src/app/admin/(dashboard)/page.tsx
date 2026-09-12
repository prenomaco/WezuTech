import Link from "next/link";
import {
  ChatCenteredTextIcon,
  PackageIcon,
  PlusIcon,
  StackIcon,
  TrayIcon,
  WarningIcon,
} from "@phosphor-icons/react/ssr";
import { PageHeader } from "@/components/dashboard/page-header";
import { LEAD_STATUS_TONE, StatusText } from "@/components/dashboard/status-text";
import { Card, CardContent, CardHeader, CardTitle, Table, Td, Th } from "@/components/dashboard/ui";
import { getProductCategories } from "@/lib/categories";
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
  readonly icon: typeof TrayIcon;
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

const QUICK_ACTION =
  "flex items-center gap-2.5 rounded-lg border border-[var(--dash-border)] px-3.5 py-3 text-sm " +
  "text-[var(--dash-fg)] transition-colors hover:border-[var(--dash-border-strong)] hover:bg-[var(--dash-subtle)]";

/**
 * The overview's lower half.
 *
 * The page used to be four tiles and a recent-enquiries table, which left
 * most of a tall screen empty. What fills it is the three questions someone
 * opening this page actually has: what has come in, what is the catalogue
 * shaped like, and is anything wrong. So: the enquiries table, a breakdown by
 * category, and a list of things that need a decision. Each item in that last
 * card is a link, because a warning you cannot act on from where you read it
 * is just decoration.
 */
function NeedsAttention({
  items,
}: {
  readonly items: readonly { label: string; href: string }[];
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Needs attention</CardTitle>
        <WarningIcon
          aria-hidden
          className={`size-4 ${items.length ? "text-[var(--dash-status-warning)]" : "text-[var(--dash-muted)]"}`}
        />
      </CardHeader>
      <CardContent>
        {items.length ? (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.label}>
                <Link
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--dash-border)] px-3.5 py-2.5 text-sm text-[var(--dash-fg)] transition-colors hover:border-[var(--dash-border-strong)] hover:bg-[var(--dash-subtle)]"
                  href={item.href}
                >
                  <span>{item.label}</span>
                  <span aria-hidden className="text-[var(--dash-muted)]">
                    &rsaquo;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--dash-muted)]">
            Nothing outstanding. Every product is published and categorised.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default async function OverviewPage() {
  const [leadCount, newLeads, productCount, publishedCount, draftCount, uncategorised, testimonialCount, hiddenTestimonials, recent, categories] =
    await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.product.count(),
      prisma.product.count({ where: { status: "PUBLISHED" } }),
      prisma.product.count({ where: { status: "DRAFT" } }),
      prisma.product.count({ where: { categories: { none: {} } } }),
      prisma.testimonial.count(),
      prisma.testimonial.count({ where: { isPublished: false } }),
      prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, name: true, email: true, subject: true, status: true, createdAt: true },
      }),
      getProductCategories(),
    ]);

  const emptyCategories = categories.filter((category) => category.productCount === 0);

  const attention: { label: string; href: string }[] = [
    ...(newLeads
      ? [{ label: `${newLeads} enquir${newLeads === 1 ? "y" : "ies"} not yet triaged`, href: "/admin/leads" }]
      : []),
    ...(draftCount
      ? [{ label: `${draftCount} product${draftCount === 1 ? "" : "s"} still in draft`, href: "/admin/products" }]
      : []),
    ...(uncategorised
      ? [
          {
            label: `${uncategorised} product${uncategorised === 1 ? "" : "s"} with no category`,
            href: "/admin/products",
          },
        ]
      : []),
    ...(emptyCategories.length
      ? [
          {
            label: `${emptyCategories.length} categor${emptyCategories.length === 1 ? "y" : "ies"} with no products`,
            href: "/admin/categories",
          },
        ]
      : []),
    ...(hiddenTestimonials
      ? [
          {
            label: `${hiddenTestimonials} testimonial${hiddenTestimonials === 1 ? "" : "s"} hidden from the site`,
            href: "/admin/testimonials",
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader description="Everything the site is currently serving, at a glance." title="Overview" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          hint={newLeads ? `${newLeads} still new` : "All triaged"}
          href="/admin/leads"
          icon={TrayIcon}
          label="Enquiries"
          value={leadCount}
        />
        <Stat
          hint={`${publishedCount} published, ${draftCount} draft`}
          href="/admin/products"
          icon={PackageIcon}
          label="Products"
          value={productCount}
        />
        <Stat
          hint={emptyCategories.length ? `${emptyCategories.length} with no products` : "All in use"}
          href="/admin/categories"
          icon={StackIcon}
          label="Categories"
          value={categories.length}
        />
        <Stat
          hint={hiddenTestimonials ? `${hiddenTestimonials} hidden` : "All live on the site"}
          href="/admin/testimonials"
          icon={ChatCenteredTextIcon}
          label="Testimonials"
          value={testimonialCount}
        />
      </div>

      {/* `items-start` so each column sizes to its own content: stretched, a
          two-row enquiries table was drawn as tall as the two stacked cards
          beside it and left most of itself empty. */}
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
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
                      <Td className="hidden text-[var(--dash-muted)] sm:table-cell">
                        {lead.subject ?? "No subject"}
                      </Td>
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

        <div className="flex flex-col gap-4">
          <NeedsAttention items={attention} />

          <Card>
            <CardHeader>
              <CardTitle>Add something</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link className={QUICK_ACTION} href="/admin/products/new">
                <PlusIcon aria-hidden className="size-4 text-[var(--dash-primary)]" /> New product
              </Link>
              <Link className={QUICK_ACTION} href="/admin/categories/new">
                <PlusIcon aria-hidden className="size-4 text-[var(--dash-primary)]" /> New category
              </Link>
              <Link className={QUICK_ACTION} href="/admin/testimonials/new">
                <PlusIcon aria-hidden className="size-4 text-[var(--dash-primary)]" /> New testimonial
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Catalogue by category</CardTitle>
          <Link className="text-sm text-[var(--dash-primary)] hover:underline" href="/admin/categories">
            Manage
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {categories.length ? (
            <Table>
              <thead>
                <tr>
                  <Th>Category</Th>
                  <Th>Description</Th>
                  <Th className="text-right">Published products</Th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <Td className="font-medium whitespace-nowrap">{category.name}</Td>
                    <Td className="max-w-[34rem] text-xs text-[var(--dash-muted)]">{category.blurb}</Td>
                    <Td className="text-right tabular-nums">
                      {category.productCount ? (
                        category.productCount
                      ) : (
                        <span className="text-[var(--dash-status-warning)]">0</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="px-5 pb-5 text-sm text-[var(--dash-muted)]">
              No categories yet. Add the first product family.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
