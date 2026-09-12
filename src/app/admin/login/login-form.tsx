"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  EyeIcon,
  EyeSlashIcon,
  SpinnerIcon,
} from "@phosphor-icons/react/ssr";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("That email and password do not match an account.");
      setPending(false);
      return;
    }

    router.replace("/admin");
  }

  return (
    <form className="mt-7 flex flex-col gap-4" onSubmit={submit}>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[var(--dash-muted)]">Email</span>
        <input
          autoComplete="email"
          className="dash-input"
          name="email"
          placeholder="you@wezutech.com"
          required
          type="email"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[var(--dash-muted)]">Password</span>
        <div className="relative">
          <input
            autoComplete="current-password"
            className="dash-input w-full pr-10"
            name="password"
            placeholder="••••••••"
            required
            type={showPassword ? "text" : "password"}
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[var(--dash-muted)] transition-colors duration-200 hover:text-[var(--dash-fg)]"
            onClick={() => setShowPassword((current) => !current)}
            type="button"
          >
            {showPassword ? <EyeSlashIcon aria-hidden className="size-4" /> : <EyeIcon aria-hidden className="size-4" />}
          </button>
        </div>
      </label>

      {error ? (
        <p
          className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button
        className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--dash-primary)] text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:bg-[var(--dash-primary-hover)] active:translate-y-px disabled:pointer-events-none disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? <SpinnerIcon aria-hidden className="size-4 animate-spin" /> : null}
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
