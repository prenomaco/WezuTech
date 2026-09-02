import type { Metadata } from "next";
import "@/app/admin/admin.css";
import { LoginForm } from "@/app/admin/login/login-form";

/**
 * `next-auth/react` resolves NEXTAUTH_URL when its module is evaluated. During
 * a static export that variable is not present, so prerendering this route
 * threw `TypeError: Invalid URL` and failed the build. A sign-in screen has
 * nothing to prerender anyway, so the route opts out of static generation.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function AdminLogin() {
  return (
    <main className="login-wrap">
      <section className="login-card">
        <p className="eyebrow">WEZU ADMIN</p>
        <h1>Sign in</h1>
        <LoginForm />
      </section>
    </main>
  );
}
