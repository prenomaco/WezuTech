import type { LeadStatus, ProductStatus } from "@prisma/client";
import { cn } from "@/lib/cn";

/**
 * A record's state, as coloured text.
 *
 * Not a pill, and not shouting. A pill is a control's shape — it reads as
 * something to press — and a table that pills every row turns its busiest
 * column into a row of buttons that do nothing. `PUBLISHED` in caps on seven
 * consecutive rows is also the loudest thing on the page while being the
 * least surprising: everything is published, so the column should be quiet
 * and only the exceptions should catch the eye.
 *
 * So: sentence case, the state's own colour, and a small dot to carry that
 * colour at a glance without boxing the word.
 */
const TONE = {
  neutral: "text-[var(--dash-muted)]",
  info: "text-sky-400",
  success: "text-emerald-400",
  warning: "text-amber-400",
  danger: "text-red-400",
} as const;

export type StatusTone = keyof typeof TONE;

const DOT = {
  neutral: "bg-[var(--dash-muted)]",
  info: "bg-sky-400",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-red-400",
} as const;

/** `PUBLISHED` -> `Published`, `LOAD_BALANCING` -> `Load balancing`. */
export function titleCase(value: string) {
  const spaced = value.replace(/_/g, " ").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export const PRODUCT_STATUS_TONE: Record<ProductStatus, StatusTone> = {
  PUBLISHED: "success",
  DRAFT: "warning",
  ARCHIVED: "neutral",
};

export const LEAD_STATUS_TONE: Record<LeadStatus, StatusTone> = {
  NEW: "info",
  CONTACTED: "warning",
  QUALIFIED: "success",
  CLOSED: "neutral",
  SPAM: "danger",
};

export function StatusText({
  children,
  tone = "neutral",
  className,
}: {
  readonly children: string;
  readonly tone?: StatusTone;
  readonly className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm font-medium", TONE[tone], className)}>
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", DOT[tone])} />
      {titleCase(children)}
    </span>
  );
}
