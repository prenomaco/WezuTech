"use client";

import { useState, type FormEvent } from "react";
import { SpinnerIcon } from "@phosphor-icons/react/ssr";
import { changePassword } from "@/app/admin/actions";

export function ChangePasswordForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // `currentTarget` goes null once the event has finished dispatching,
    // which happens well before this `await` resolves.
    const form = event.currentTarget;
    const data = new FormData(form);
    setError("");
    setSuccess(false);
    setPending(true);
    const result = await changePassword(data);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    form.reset();
  }

  return (
    <form className="flex max-w-sm flex-col gap-3" onSubmit={submit}>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[var(--dash-muted)]">Current password</span>
        <input autoComplete="current-password" className="dash-input w-full" name="currentPassword" required type="password" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[var(--dash-muted)]">New password</span>
        <input autoComplete="new-password" className="dash-input w-full" minLength={8} name="newPassword" required type="password" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[var(--dash-muted)]">Confirm new password</span>
        <input autoComplete="new-password" className="dash-input w-full" minLength={8} name="confirmPassword" required type="password" />
      </label>

      {error ? (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300" role="status">
          Password updated.
        </p>
      ) : null}

      <button
        className="mt-1 inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-[var(--dash-primary)] px-5 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[var(--dash-primary-hover)] active:translate-y-px disabled:pointer-events-none disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? <SpinnerIcon aria-hidden className="size-4 animate-spin" /> : null}
        {pending ? "Saving" : "Save password"}
      </button>
    </form>
  );
}
