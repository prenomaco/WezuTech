import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { DashboardAtmosphere } from "@/components/dashboard/dashboard-atmosphere";
import { Sidebar } from "@/components/dashboard/sidebar";
import { authOptions } from "@/lib/auth";
import { RAIL_COOKIE } from "@/lib/dashboard-rail";
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
  const initialCollapsed = (await cookies()).get(RAIL_COOKIE)?.value === "1";

  return (
    <div className="dashboard-root relative min-h-screen text-[var(--dash-fg)]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar email={session.user.email ?? ""} initialCollapsed={initialCollapsed} />

        {/* The light belongs to the content column, not to the window: anchored
            to the page it would spend its brightest part behind the rail, which
            is opaque. Here its left edge is the rail's right edge, which is
            where the site gathers its own. */}
        {/* No page title here any more. The shell printed a fixed "Dashboard"
            as the `h1` and every page then printed its own name as an `h2`
            beneath it, so the biggest words on screen were the same four on
            every route and the word that said where you were came second.
            Each page owns its own `h1` through `PageHeader`. */}
        <div className="relative min-w-0 flex-1">
          <DashboardAtmosphere />
          <main className="relative z-10 px-6 pt-8 pb-14 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
