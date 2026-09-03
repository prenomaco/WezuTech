import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Sidebar } from "@/components/dashboard/sidebar";
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
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/admin/login");

  return (
    <div className="dashboard-root relative min-h-screen text-[var(--dash-fg)]">
      <div aria-hidden className="dashboard-glow" />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <Sidebar email={session.user.email ?? ""} />

        <div className="min-w-0 flex-1">
          <header className="px-6 pt-8 pb-7 lg:px-10">
            {/* Centauri, as the site sets every display line. */}
            <h1 className="font-display text-[clamp(1.5rem,3.2vw,2.5rem)] leading-[1.1] text-[var(--dash-fg)]">
              Wezutech Dashboard
            </h1>
            <p className="mt-2 h-px w-full max-w-[22rem] bg-gradient-to-r from-[var(--dash-primary)]/70 to-transparent" />
          </header>

          <main className="px-6 pb-14 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
