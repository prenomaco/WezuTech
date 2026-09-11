import type { LeadStatus, ProductStatus } from "@prisma/client";
import { cn } from "@/lib/cn";

/**
 * A record's state, as coloured text.
 *
 * Not a pill, and not shouting. A pill is a control's shape, so it reads as
 * something to press, and a table that pills every row turns its quietest
 * column into a row of buttons that do nothing. `PUBLISHED` in caps on seven
 * consecutive rows was also the loudest thing on the page while being the
 * least surprising: everything is published, so the column should be quiet
 * and only the exceptions should catch the eye.
 *
 * No dot either. With the colour already carried by the word, the dot was a
 * second marker for the same fact, and six of them down a column made a
 * stray vertical line of bullets beside the text.
 *
 * The colours are `--dash-status-*`, defined in `dashboard.css` inside the
 * site's own range rather than taken from Tailwind's default scale.
 */
const TONE = {
  neutral: "text-[var(--dash-status-neutral)]",
  info: "text-[var(--dash-status-info)]",
  success: "text-[var(--dash-status-success)]",
  warning: "text-[var(--dash-status-warning)]",
  danger: "text-[var(--dash-status-danger)]",
} as const;

export type StatusTone = keyof typeof TONE;

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
    <span className={cn("text-sm font-medium", TONE[tone], className)}>{titleCase(children)}</span>
  );
}
