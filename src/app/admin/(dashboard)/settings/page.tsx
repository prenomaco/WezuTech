import { ChangePasswordForm } from "@/components/change-password-form";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl text-[var(--dash-fg)]">Settings</h2>
        <p className="text-sm text-[var(--dash-muted)]">Manage your own admin account.</p>
      </div>
      <section className="flex flex-col gap-4 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-card)] p-5">
        <div>
          <h3 className="text-sm font-semibold text-[var(--dash-fg)]">Change password</h3>
          <p className="mt-0.5 text-xs text-[var(--dash-muted)]">Only affects your own admin account.</p>
        </div>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
