"use client";

import { Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The search-and-filter row that sits above every dashboard table.
 *
 * One component so the three tables cannot drift into three different search
 * boxes. Filtering happens in the browser, against rows the page already
 * fetched: the catalogue is tens of records, not thousands, so a round trip
 * per keystroke would add latency to answer a question the client can already
 * answer instantly.
 */
export function SearchField({
  value,
  onChange,
  placeholder,
  label,
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly label: string;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--dash-muted)]"
      />
      <input
        aria-label={label}
        className={
          "h-10 w-full rounded-lg border border-[var(--dash-border-strong)] bg-[rgb(2_7_28/0.6)] " +
          "pr-9 pl-9 text-sm text-[var(--dash-fg)] placeholder:text-[var(--dash-muted)] " +
          "focus-visible:border-[var(--dash-primary)] focus-visible:ring-2 focus-visible:ring-[rgb(9_133_204/0.22)] focus-visible:outline-none"
        }
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
      {value ? (
        <button
          aria-label="Clear search"
          className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded text-[var(--dash-muted)] transition-colors hover:bg-[var(--dash-subtle)] hover:text-[var(--dash-fg)]"
          onClick={() => onChange("")}
          type="button"
        >
          <X aria-hidden className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

/** A labelled `<select>` used as a filter, with its label as the first option. */
export function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  allLabel,
  label,
  className,
}: {
  readonly value: T | "";
  readonly onChange: (value: T | "") => void;
  readonly options: readonly { value: T; label: string; count?: number }[];
  readonly allLabel: string;
  readonly label: string;
  readonly className?: string;
}) {
  return (
    <select
      aria-label={label}
      className={cn(
        "h-10 shrink-0 rounded-lg border border-[var(--dash-border-strong)] bg-[rgb(2_7_28/0.6)] px-3 text-sm text-[var(--dash-fg)]",
        "focus-visible:border-[var(--dash-primary)] focus-visible:ring-2 focus-visible:ring-[rgb(9_133_204/0.22)] focus-visible:outline-none",
        value ? "text-[var(--dash-fg)]" : "text-[var(--dash-muted)]",
        className,
      )}
      onChange={(event) => onChange(event.target.value as T | "")}
      value={value}
    >
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
          {option.count === undefined ? "" : ` (${option.count})`}
        </option>
      ))}
    </select>
  );
}

export function Toolbar({ children }: { readonly children: ReactNode }) {
  return <div className="flex flex-col gap-2 sm:flex-row sm:items-center">{children}</div>;
}

/**
 * "12 of 34 products" — shown only while a filter is narrowing the table, so
 * the count is information rather than furniture.
 */
export function ResultCount({
  shown,
  total,
  noun,
}: {
  readonly shown: number;
  readonly total: number;
  readonly noun: string;
}) {
  if (shown === total) return null;
  return (
    <p className="text-xs text-[var(--dash-muted)]">
      Showing {shown} of {total} {noun}
    </p>
  );
}

/** What a table shows when it has nothing, or nothing that matches. */
export function EmptyState({
  children,
  filtered,
}: {
  readonly children: ReactNode;
  /** True when rows exist but the filters exclude all of them. */
  readonly filtered: boolean;
}) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--dash-border-strong)] px-5 py-14 text-center">
      <p className="text-sm text-[var(--dash-muted)]">
        {filtered ? "Nothing matches those filters." : children}
      </p>
    </div>
  );
}
