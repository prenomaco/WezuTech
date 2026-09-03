import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Inbox, LayoutDashboard, Package } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { authOptions } from "@/lib/auth";
import "@/app/admin/dashboard.css";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Wezu admin" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The dashboard shell.
 *
 * The guard lives here rather than on each page, so a route added under this
 * folder is signed-in by construction. Sign-in itself sits outside the group,
 * at `/admin/login`, which is why the group exists at all: putting the guard on
 * `/admin/layout.tsx` would wrap the sign-in page in its own redirect.
 */
const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Enquiries", icon: Inbox },
  { href: "/admin/products", label: "Products", icon: Package },
] as const;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/admin/login");

  return (
    <div className="dashboard-root min-h-screen bg-[var(--dash-bg)] text-[var(--dash-fg)]">
      <div className="mx-auto flex w-full max-w-[90rem] flex-col lg:flex-row">
        <aside className="shrink-0 border-b border-[var(--dash-border)] lg:min-h-screen lg:w-60 lg:border-r lg:border-b-0">
          <div className="flex items-center gap-2 px-5 py-4">
            <span className="grid size-7 place-items-center rounded-md bg-[var(--dash-primary)] text-xs font-bold text-white">
              W
            </span>
            <span className="text-sm font-semibold">Wezu</span>
          </div>

          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--dash-muted)] transition-colors hover:bg-[var(--dash-subtle)] hover:text-[var(--dash-fg)]"
                href={href}
                key={href}
              >
                <Icon aria-hidden className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between gap-4 border-b border-[var(--dash-border)] px-6 py-3">
            <p className="truncate text-sm text-[var(--dash-muted)]">
              Signed in as <span className="text-[var(--dash-fg)]">{session.user.email}</span>
            </p>
            <SignOutButton />
          </header>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
