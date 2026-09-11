"use client";

import type { LeadStatus } from "@prisma/client";
import { Building2, Mail, Package, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateLead } from "@/app/admin/actions";
import { LEAD_STATUS_TONE, StatusText, titleCase } from "@/components/dashboard/status-text";
import { EmptyState, FilterSelect, ResultCount, SearchField, Toolbar } from "@/components/dashboard/toolbar";
import { Button, Select, Textarea } from "@/components/dashboard/ui";

export interface LeadRow {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string | null;
  readonly company: string | null;
  readonly subject: string | null;
  readonly message: string;
  readonly status: LeadStatus;
  readonly internalNotes: string | null;
  readonly receivedAt: string;
  readonly productName: string | null;
}

const STATUSES: readonly LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED", "SPAM"];

/**
 * Enquiries, as a reading surface rather than a table.
 *
 * The old page put three columns in a row — sender, message, and a status
 * select with a notes box and a Save button stacked inside the third cell.
 * That made every row as tall as a form, wrapped the message into a narrow
 * column beside it, and repeated the caps status twice: once as a pill and
 * again as the first option of the select directly beneath it.
 *
 * An enquiry is a message, so each one is a card: who it is from and how to
 * reach them on the left, what they said in the middle at a readable measure,
 * and the two things that are actually editable — the state and the internal
 * note — gathered on the right under one Save. The status is stated once, as
 * text, and the select is the thing that changes it.
 */
function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" disabled={pending} size="sm" type="submit">
      {pending ? "Saving…" : "Save"}
    </Button>
  );
}

function Contact({ icon: Icon, children, href }: {
  readonly icon: typeof Mail;
  readonly children: string;
  readonly href?: string;
}) {
  const body = (
    <span className="inline-flex min-w-0 items-center gap-2 text-xs text-[var(--dash-muted)]">
      <Icon aria-hidden className="size-3.5 shrink-0" />
      <span className="truncate">{children}</span>
    </span>
  );
  return href ? (
    <a className="block min-w-0 hover:text-[var(--dash-fg)]" href={href}>
      {body}
    </a>
  ) : (
    <span className="block min-w-0">{body}</span>
  );
}

function LeadCard({ lead }: { readonly lead: LeadRow }) {
  return (
    <article className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)]">
      <div className="grid gap-5 p-5 lg:grid-cols-[15rem_minmax(0,1fr)_16rem]">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="font-medium text-[var(--dash-fg)]">{lead.name}</p>
          <Contact href={`mailto:${lead.email}`} icon={Mail}>
            {lead.email}
          </Contact>
          {lead.phone ? (
            <Contact href={`tel:${lead.phone}`} icon={Phone}>
              {lead.phone}
            </Contact>
          ) : null}
          {lead.company ? <Contact icon={Building2}>{lead.company}</Contact> : null}
          <p className="mt-1 text-xs text-[var(--dash-muted)]">{lead.receivedAt}</p>
        </div>

        <div className="min-w-0">
          {lead.subject ? (
            <h2 className="text-sm font-semibold text-[var(--dash-fg)]">{lead.subject}</h2>
          ) : null}
          <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-[var(--dash-muted)]">
            {lead.message}
          </p>
          {lead.productName ? (
            <p className="mt-3 inline-flex items-center gap-2 text-xs text-[var(--dash-muted)]">
              <Package aria-hidden className="size-3.5" />
              Enquired about {lead.productName}
            </p>
          ) : null}
        </div>

        <form action={updateLead} className="flex flex-col gap-2">
          <input name="id" type="hidden" value={lead.id} />
          <div className="flex items-center justify-between gap-2">
            <StatusText tone={LEAD_STATUS_TONE[lead.status]}>{lead.status}</StatusText>
          </div>
          <Select aria-label={`Status for ${lead.name}`} defaultValue={lead.status} name="status">
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {titleCase(status)}
              </option>
            ))}
          </Select>
          <Textarea
            aria-label={`Internal notes for ${lead.name}`}
            defaultValue={lead.internalNotes ?? ""}
            name="internalNotes"
            placeholder="Internal notes — not sent to the sender"
            rows={3}
          />
          <SaveButton />
        </form>
      </div>
    </article>
  );
}

export function LeadsTable({ leads }: { readonly leads: readonly LeadRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | "">("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (status && lead.status !== status) return false;
      if (!needle) return true;
      return `${lead.name} ${lead.email} ${lead.company ?? ""} ${lead.subject ?? ""} ${lead.message}`
        .toLowerCase()
        .includes(needle);
    });
  }, [leads, query, status]);

  return (
    <div className="flex flex-col gap-3">
      <Toolbar>
        <SearchField
          label="Search enquiries"
          onChange={setQuery}
          placeholder="Search by name, email, company or message…"
          value={query}
        />
        <FilterSelect
          allLabel="All statuses"
          label="Filter by status"
          onChange={setStatus}
          options={STATUSES.map((value) => ({
            value,
            label: titleCase(value),
            count: leads.filter((lead) => lead.status === value).length,
          }))}
          value={status}
        />
      </Toolbar>

      <ResultCount noun="enquiries" shown={filtered.length} total={leads.length} />

      {filtered.length ? (
        <div className="flex flex-col gap-3">
          {filtered.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      ) : (
        <EmptyState filtered={leads.length > 0}>
          No enquiries yet. Submissions from the contact form land here.
        </EmptyState>
      )}
    </div>
  );
}
