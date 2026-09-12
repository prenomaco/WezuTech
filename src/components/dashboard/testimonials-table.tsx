"use client";

import Link from "next/link";
import { PencilSimpleIcon } from "@phosphor-icons/react/ssr";
import { useMemo, useState } from "react";
import { deleteTestimonial } from "@/app/admin/actions";
import { DeleteRowButton } from "@/components/dashboard/delete-row-button";
import { StatusText } from "@/components/dashboard/status-text";
import { EmptyState, FilterSelect, ResultCount, SearchField, Toolbar } from "@/components/dashboard/toolbar";
import { Table, Td, Th } from "@/components/dashboard/ui";

export interface TestimonialRow {
  readonly id: string;
  readonly client: string;
  readonly title: string;
  readonly quote: string;
  readonly lead: string | null;
  readonly isPublished: boolean;
  readonly sortOrder: number;
}

const VISIBILITY = [
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
] as const;

type Visibility = (typeof VISIBILITY)[number]["value"];

const ACTION =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--dash-border-strong)] px-2.5 " +
  "text-xs font-medium text-[var(--dash-fg)] transition-colors hover:bg-[var(--dash-subtle)]";

/** Enough of the quote to recognise it, without turning the row into a paragraph. */
function preview(quote: string) {
  const flat = quote.trim().replace(/\s+/g, " ");
  return flat.length > 120 ? `${flat.slice(0, 120)}…` : flat;
}

/**
 * The quotes behind the home and About carousels.
 *
 * Same shape as the products index, and for the same reason: this page used
 * to be a stack of `<details>` forms — "Add testimonial" plus one per quote —
 * with no table, so there was nowhere to see the set at a glance, no way to
 * search it, and the display order had to be inferred by opening each panel
 * in turn.
 */
export function TestimonialsTable({ testimonials }: { readonly testimonials: readonly TestimonialRow[] }) {
  const [query, setQuery] = useState("");
  const [visibility, setVisibility] = useState<Visibility | "">("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return testimonials.filter((testimonial) => {
      if (visibility === "published" && !testimonial.isPublished) return false;
      if (visibility === "hidden" && testimonial.isPublished) return false;
      if (!needle) return true;
      return `${testimonial.client} ${testimonial.title} ${testimonial.quote}`.toLowerCase().includes(needle);
    });
  }, [testimonials, query, visibility]);

  return (
    <div className="flex flex-col gap-3">
      <Toolbar>
        <SearchField
          label="Search testimonials"
          onChange={setQuery}
          placeholder="Search by client, headline or quote…"
          value={query}
        />
        <FilterSelect
          allLabel="All testimonials"
          label="Filter by visibility"
          onChange={setVisibility}
          options={VISIBILITY.map((option) => ({
            value: option.value,
            label: option.label,
            count: testimonials.filter((testimonial) =>
              option.value === "published" ? testimonial.isPublished : !testimonial.isPublished,
            ).length,
          }))}
          value={visibility}
        />
      </Toolbar>

      <ResultCount noun="testimonials" shown={filtered.length} total={testimonials.length} />

      {filtered.length ? (
        <div className="overflow-hidden rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)]">
          <Table>
            <thead>
              <tr>
                <Th className="w-12 text-right">#</Th>
                <Th>Client</Th>
                <Th className="hidden lg:table-cell">Quote</Th>
                <Th>Visibility</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((testimonial) => (
                <tr key={testimonial.id}>
                  <Td className="text-right text-xs tabular-nums text-[var(--dash-muted)]">
                    {testimonial.sortOrder}
                  </Td>

                  <Td>
                    <Link
                      className="font-medium text-[var(--dash-fg)] hover:text-[var(--dash-primary)]"
                      href={`/admin/testimonials/${testimonial.id}/edit`}
                    >
                      {testimonial.client}
                    </Link>
                    <span className="block text-xs text-[var(--dash-muted)]">{testimonial.title}</span>
                  </Td>

                  <Td className="hidden max-w-[32rem] lg:table-cell">
                    <span className="text-xs text-[var(--dash-muted)]">{preview(testimonial.quote)}</span>
                  </Td>

                  <Td>
                    <StatusText tone={testimonial.isPublished ? "success" : "neutral"}>
                      {testimonial.isPublished ? "PUBLISHED" : "HIDDEN"}
                    </StatusText>
                  </Td>

                  <Td>
                    <div className="flex items-center justify-end gap-1.5">
                      <Link className={ACTION} href={`/admin/testimonials/${testimonial.id}/edit`}>
                        <PencilSimpleIcon aria-hidden className="size-3.5" /> Edit
                      </Link>
                      <DeleteRowButton
                        action={deleteTestimonial}
                        id={testimonial.id}
                        name={testimonial.client}
                      />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <EmptyState filtered={testimonials.length > 0}>
          No testimonials yet. Add the first quote.
        </EmptyState>
      )}
    </div>
  );
}
