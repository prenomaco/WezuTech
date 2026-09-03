"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

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
        <input
          autoComplete="current-password"
          className="dash-input"
          name="password"
          placeholder="••••••••"
          required
          type="password"
        />
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
        {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
