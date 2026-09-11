import { ChangePasswordForm } from "@/components/change-password-form";
import { PageHeader } from "@/components/dashboard/page-header";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader description="Your own admin account." title="Settings" />

      <section className="max-w-xl rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)]">
        <div className="border-b border-[var(--dash-border)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--dash-fg)]">Change password</h2>
          <p className="mt-0.5 text-xs text-[var(--dash-muted)]">
            Only affects this account. You stay signed in.
          </p>
        </div>
        <div className="p-5">
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  );
}
