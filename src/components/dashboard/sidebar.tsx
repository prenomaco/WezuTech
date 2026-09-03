"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useSyncExternalStore } from "react";
import { signOut } from "next-auth/react";
import {
  ChevronsLeft,
  Inbox,
  LayoutDashboard,
  LogOut,
  Package,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/cn";

const NAV: readonly { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Enquiries", icon: Inbox },
  { href: "/admin/products", label: "Products", icon: Package },
];

/** Where the collapsed state is remembered, so it survives a navigation. */
const STORAGE_KEY = "wezu.dashboard.rail";

/*
 * The rail's state belongs to the browser, not to React, so it is read through
 * `useSyncExternalStore` rather than copied into state by an effect. The server
 * snapshot is always "open": it has no way to know what this browser last
 * chose, and guessing would make the first paint disagree with the markup.
 */
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function isCollapsed() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    /* Private windows and blocked storage: treat the rail as open. */
    return false;
  }
}

function setCollapsed(next: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    /* Not worth failing the interaction over. */
  }
  for (const listener of listeners) listener();
}

export function Sidebar({ email }: { readonly email: string }) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(subscribe, isCollapsed, () => false);
  const toggle = useCallback(() => setCollapsed(!isCollapsed()), []);

  return (
    <aside
      className={cn(
        "dashboard-rail relative z-10 flex shrink-0 flex-col border-b transition-[width] duration-300 ease-out",
        "lg:min-h-screen lg:border-r lg:border-b-0",
        collapsed ? "lg:w-[4.5rem]" : "lg:w-60",
      )}
    >
      <div className="flex items-center gap-2 px-4 py-4">
        {/* The site's own lockup. Collapsed, the rail keeps the mark and lets
            the wordmark run past its edge, which the overflow then hides. */}
        <div className={cn("shrink-0 overflow-hidden", collapsed && "lg:w-11")}>
          <Logo className="origin-left scale-[0.86]" href="/admin" />
        </div>

        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="ml-auto hidden size-7 shrink-0 place-items-center rounded-md text-[var(--dash-muted)] transition-colors hover:bg-[var(--dash-rail-hover)] hover:text-[var(--dash-fg)] lg:grid"
          onClick={toggle}
          type="button"
        >
          <ChevronsLeft
            aria-hidden
            className={cn("size-4 transition-transform duration-300", collapsed && "rotate-180")}
          />
        </button>
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

      {/* The account sits at the foot of the rail, where a dashboard puts it,
          rather than in the page header where it competed with the title. It is
          given a panel of its own so it reads as the account control it is,
          not as a caption under the navigation. */}
      <div className="mt-auto p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border border-[var(--dash-border-strong)] bg-[var(--dash-card)] p-2.5",
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
            <LogOut aria-hidden className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
