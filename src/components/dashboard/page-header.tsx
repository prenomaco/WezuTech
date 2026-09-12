import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";

/**
 * Every dashboard page's title block.
 *
 * The shell used to print a fixed "Dashboard" as the page's `h1` and each
 * page then printed its own name as an `h2` underneath, so the largest words
 * on the screen were the same four on every route and the one word that told
 * you where you were came second and smaller. The shell now owns only the
 * chrome; this owns the page's identity — its `h1`, a line of context, and the
 * primary action, which belongs on the same line as the title rather than
 * somewhere further down the page.
 */
export function PageHeader({
  title,
  description,
  action,
}: {
  readonly title: string;
  readonly description?: string;
  /** The page's primary action — "Add product" and the like. */
  readonly action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {/* Centauri, as the site sets every display line. */}
        <h1 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.15] text-[var(--dash-fg)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-[46rem] text-sm text-[var(--dash-muted)]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </header>
  );
}

/**
 * The way back out of a form page.
 *
 * Above the title rather than beside it: on a page whose job is a single
 * task, leaving is not one of the actions — it is the thread back to where
 * the task came from, which is what a breadcrumb is.
 */
export function BackLink({ href, children }: { readonly href: string; readonly children: string }) {
  return (
    <Link
      className="inline-flex w-fit items-center gap-1.5 text-sm text-[var(--dash-muted)] transition-colors hover:text-[var(--dash-fg)]"
      href={href}
    >
      <ArrowLeftIcon aria-hidden className="size-3.5" />
      {children}
    </Link>
  );
}

/**
 * A page's primary action, as a link.
 *
 * "Add product" and "Add testimonial" go to their own pages, so the control
 * is an anchor that looks like the filled button it behaves as, rather than a
 * button wired to a router push.
 */
export function PrimaryActionLink({ href, children }: { readonly href: string; readonly children: ReactNode }) {
  return (
    <Link
      className={
        "inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--dash-primary)] px-4 text-sm font-medium " +
        "text-white transition-colors hover:bg-[var(--dash-primary-hover)] " +
        "focus-visible:ring-2 focus-visible:ring-[var(--dash-primary)] focus-visible:outline-none"
      }
      href={href}
    >
      {children}
    </Link>
  );
}
