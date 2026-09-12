"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { signOut } from "next-auth/react";
import type { Icon } from "@phosphor-icons/react/lib";
import {
  CaretDoubleLeftIcon,
  ChatCenteredTextIcon,
  GearIcon,
  PackageIcon,
  SignOutIcon,
  SquaresFourIcon,
  StackIcon,
  TrayIcon,
} from "@phosphor-icons/react/ssr";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/cn";
import { RAIL_COOKIE, RAIL_COOKIE_MAX_AGE } from "@/lib/dashboard-rail";

const NAV: readonly { href: string; label: string; icon: Icon }[] = [
  { href: "/admin", label: "Overview", icon: SquaresFourIcon },
  { href: "/admin/leads", label: "Enquiries", icon: TrayIcon },
  { href: "/admin/products", label: "Products", icon: PackageIcon },
  { href: "/admin/categories", label: "Categories", icon: StackIcon },
  { href: "/admin/testimonials", label: "Testimonials", icon: ChatCenteredTextIcon },
];

/**
 * A cookie rather than `localStorage`, so the *server* can render the rail
 * at its remembered width on the very first response.
 *
 * The previous version read `localStorage` through `useSyncExternalStore`,
 * which has no way to inform the server — `getServerSnapshot` always said
 * "open". That is fine for one first load, but every navigation re-runs this
 * component against that same "open" server render before the client
 * snapshot corrects it a tick later, so a collapsed rail would flash open on
 * every click. A cookie is available to `layout.tsx` before it renders
 * anything, so the first paint is already correct and there is nothing to
 * correct.
 */
export function Sidebar({
  email,
  initialCollapsed,
}: {
  readonly email: string;
  readonly initialCollapsed: boolean;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const settingsActive = pathname.startsWith("/admin/settings");

  const toggle = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      document.cookie = `${RAIL_COOKIE}=${next ? "1" : "0"}; path=/; max-age=${RAIL_COOKIE_MAX_AGE}; SameSite=Lax`;
      return next;
    });
  }, []);

  return (
    <aside
      className={cn(
        "dashboard-rail relative z-10 flex shrink-0 flex-col border-b transition-[width] duration-300 ease-out",
        // Pinned to the viewport and never its own scroll container — only
        // the page (the content column) scrolls. `sticky` rather than
        // `fixed` so it stays a normal flex sibling and the content column
        // doesn't need a matching margin to avoid sitting underneath it.
        "lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden lg:border-r lg:border-b-0",
        collapsed ? "lg:w-[4.5rem]" : "lg:w-60",
      )}
    >
      <div className="flex items-center gap-2 px-4 py-4">
        {/* The site's own lockup. Collapsed, the rail keeps the mark and lets
            the wordmark run past its edge, which the overflow then hides. */}
        <div className={cn("shrink-0 overflow-hidden", collapsed && "lg:w-11")}>
          <Logo className="origin-left scale-[0.86]" href="/admin" />
        </div>
      </div>

      <nav className="flex gap-1.5 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              className="dashboard-link relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.9375rem] whitespace-nowrap text-[var(--dash-muted)] transition-colors hover:bg-[var(--dash-rail-hover)] hover:text-[var(--dash-fg)]"
              data-active={active}
              href={href}
              key={href}
              /*
               * Explicit `true`, not the default.
               *
               * These routes are `force-dynamic`, and for a dynamic route the
               * default prefetch fetches only the shared layout — the page
               * itself is still fetched on click, which is the 210-560ms every
               * navigation in this rail was waiting on. `true` prefetches the
               * full payload, so by the time the pointer arrives the page is
               * usually already in the router cache. There are four
               * destinations and one of them is where you already are, so this
               * is three small requests, not a crawl of the app.
               */
              prefetch
              title={collapsed ? label : undefined}
            >
              <Icon aria-hidden className="size-[1.125rem] shrink-0" />
              <span className={cn("transition-opacity duration-200", collapsed && "lg:hidden")}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Everything below lives at the foot of the rail: the controls that
          act on the rail/account rather than navigate the page (Collapse,
          Settings), and the account panel itself, in that order. Grouping
          them here — rather than Collapse up by the logo — keeps every
          "not a page" control in one place at the bottom. */}
      <div className="mt-auto flex flex-col gap-1.5 p-3">
        {/* Collapse sits beside Settings rather than above it as its own
            row — a small square icon button, not a full nav-style row,
            since it acts on the rail rather than navigating anywhere.
            Collapsed, there isn't room for both side by side, so they stack
            instead, still as the same two controls. */}
        <div className={cn("flex gap-1.5", collapsed ? "flex-col items-center" : "items-center")}>
          <Link
            className="dashboard-link flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-[0.9375rem] whitespace-nowrap text-[var(--dash-muted)] transition-colors hover:bg-[var(--dash-rail-hover)] hover:text-[var(--dash-fg)]"
            data-active={settingsActive}
            href="/admin/settings"
            prefetch
            title={collapsed ? "Settings" : undefined}
          >
            <GearIcon aria-hidden className="size-[1.125rem] shrink-0" />
            <span className={cn("transition-opacity duration-200", collapsed && "lg:hidden")}>
              Settings
            </span>
          </Link>

          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden size-9 shrink-0 place-items-center rounded-md text-[var(--dash-muted)] transition-colors hover:bg-[var(--dash-rail-hover)] hover:text-[var(--dash-fg)] lg:grid"
            onClick={toggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            type="button"
          >
            <CaretDoubleLeftIcon
              aria-hidden
              className={cn("size-[1.125rem] transition-transform duration-300", collapsed && "rotate-180")}
            />
          </button>
        </div>

        {/* The account sits at the foot of the rail, where a dashboard puts
            it, rather than in the page header where it competed with the
            title. It is given a panel of its own so it reads as the account
            control it is, not as a caption under the navigation. */}
        <div
          className={cn(
            "mt-1.5 flex items-center gap-3 rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-card)] p-2.5",
            collapsed && "lg:justify-center lg:p-2",
          )}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--dash-primary)] text-sm font-semibold text-white">
            {email.slice(0, 1).toUpperCase()}
          </span>

          <div className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
            <p className="truncate text-[0.8125rem] font-medium text-[var(--dash-fg)]">
              {email.split("@")[0]}
            </p>
            <p className="truncate text-[0.6875rem] text-[var(--dash-muted)]">{email}</p>
          </div>

          <button
            aria-label="Sign out"
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-md text-[var(--dash-muted)] transition-colors hover:bg-[var(--dash-rail-hover)] hover:text-[var(--dash-fg)]",
              collapsed && "lg:hidden",
            )}
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            title="Sign out"
            type="button"
          >
            <SignOutIcon aria-hidden className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
