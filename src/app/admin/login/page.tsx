import type { Metadata } from "next";
import { LoginForm } from "@/app/admin/login/login-form";
import { DashboardAtmosphere } from "@/components/dashboard/dashboard-atmosphere";
import { Logo } from "@/components/ui/logo";
import "@/app/admin/dashboard.css";

/**
 * `next-auth/react` resolves NEXTAUTH_URL when its module is evaluated. During
 * a static export that variable is not present, so prerendering this route
 * threw `TypeError: Invalid URL` and failed the build. A sign-in screen has
 * nothing to prerender anyway, so the route opts out of static generation.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default function AdminLogin() {
  return (
    <div className="dashboard-root relative grid min-h-screen place-items-center overflow-hidden px-6">
      <DashboardAtmosphere />

      <main className="relative z-10 w-full max-w-[26rem]">
        <Logo className="mx-auto" href="/" />

        <section className="mt-8 rounded-2xl border border-[var(--dash-border-strong)] bg-[var(--dash-card)] p-7 backdrop-blur-sm">
          <h1 className="font-display text-2xl leading-tight text-[var(--dash-fg)]">Admin login</h1>
          <p className="mt-1.5 text-sm text-[var(--dash-muted)]">
            Enter your details to reach the dashboard.
          </p>

          <LoginForm />
        </section>
      </main>
    </div>
  );
}
