"use client";

import type { LeadStatus } from "@prisma/client";
import {
  BuildingOfficeIcon,
  CaretRightIcon,
  EnvelopeSimpleIcon,
  PackageIcon,
  PhoneIcon,
} from "@phosphor-icons/react/ssr";
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
 * The old page put three columns in a row: sender, message, and a status
 * select with a notes box and a Save button stacked inside the third cell,
 * all of it open at once.
 * That made every row as tall as a form, wrapped the message into a narrow
 * column beside it, and repeated the caps status twice, once as a pill and
 * again as the first option of the select directly beneath it.
 *
 * An enquiry is a message, so each one is a card that opens: the closed row
 * says who it is from, their address and what it is about, and opening it
 * gives the full message with the contact details on the left and the two
 * editable things, the state and the internal note, gathered on the right
 * under one Save.
 */
function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} size="sm" type="submit">
      {pending ? "Saving…" : "Save"}
    </Button>
  );
}

function Contact({ icon: Icon, children, href }: {
  readonly icon: typeof EnvelopeSimpleIcon;
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
  /*
   * Collapsed by default.
   *
   * Every enquiry was a full-height card: contact block, message and editor
   * side by side, about 200px tall whether it held two words or twenty lines.
   * At the 200 this page fetches that is a very long scroll to find anything,
   * and most of it is detail you only want for the one you are working on.
   *
   * The closed row carries what identifies an enquiry — who, their address,
   * what it is about — plus its state and when it arrived. Opening one reveals
   * exactly what the card showed before.
   */
  const [open, setOpen] = useState(false);

  return (
    <article className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)]">
      <h2>
        <button
          aria-expanded={open}
          className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--dash-card-hover)]"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <CaretRightIcon
            aria-hidden
            className={`size-4 shrink-0 text-[var(--dash-muted)] transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          />

          <span className="min-w-0 flex-1 gap-4 sm:flex sm:items-baseline">
            <span className="min-w-0 shrink-0 sm:w-[12rem]">
              <span className="block truncate font-medium text-[var(--dash-fg)]">{lead.name}</span>
              <span className="block truncate text-xs text-[var(--dash-muted)]">{lead.email}</span>
            </span>
            <span className="mt-1 block min-w-0 flex-1 truncate text-sm text-[var(--dash-muted)] sm:mt-0">
              {lead.subject ?? "No subject"}
            </span>
          </span>

          <span className="hidden shrink-0 sm:block">
            <StatusText tone={LEAD_STATUS_TONE[lead.status]}>{lead.status}</StatusText>
          </span>
          <span className="hidden w-[9.5rem] shrink-0 text-right text-xs text-[var(--dash-muted)] lg:block">
            {lead.receivedAt}
          </span>
        </button>
      </h2>

      {open ? (
        <div className="grid gap-5 border-t border-[var(--dash-border)] p-5 lg:grid-cols-[14rem_minmax(0,1fr)_15rem]">
          <div className="flex min-w-0 flex-col gap-1.5">
            <Contact href={`mailto:${lead.email}`} icon={EnvelopeSimpleIcon}>
              {lead.email}
            </Contact>
            {lead.phone ? (
              <Contact href={`tel:${lead.phone}`} icon={PhoneIcon}>
                {lead.phone}
              </Contact>
            ) : null}
            {lead.company ? <Contact icon={BuildingOfficeIcon}>{lead.company}</Contact> : null}
            <p className="mt-1 text-xs text-[var(--dash-muted)]">{lead.receivedAt}</p>
          </div>

          <div className="min-w-0">
            {lead.subject ? (
              <h3 className="text-sm font-semibold text-[var(--dash-fg)]">{lead.subject}</h3>
            ) : null}
            <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-[var(--dash-muted)]">
              {lead.message}
            </p>
            {lead.productName ? (
              <p className="mt-3 inline-flex items-center gap-2 text-xs text-[var(--dash-muted)]">
                <PackageIcon aria-hidden className="size-3.5" />
                Enquired about {lead.productName}
              </p>
            ) : null}
          </div>

          {/*
            * The editor, as its own labelled panel.
            *
            * It used to be a loose stack: the status as coloured text, then a
            * select repeating that same status directly beneath it, then a
            * three-row notes box, then a full-width Save. Four full-width
            * blocks for two fields, with the state stated twice.
            */}
          <form
            action={updateLead}
            className="flex flex-col gap-2.5 rounded-lg border border-[var(--dash-border)] bg-[rgb(2_7_28/0.35)] p-3.5"
          >
            <input name="id" type="hidden" value={lead.id} />

            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-medium text-[var(--dash-muted)]">Status</span>
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
              className="min-h-0"
              defaultValue={lead.internalNotes ?? ""}
              name="internalNotes"
              placeholder="Internal notes, never sent to the sender"
              rows={2}
            />

            <div className="flex justify-end">
              <SaveButton />
            </div>
          </form>
        </div>
      ) : null}
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
