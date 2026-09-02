"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.replace("/admin");
  }

  return (
    <form onSubmit={submit}>
      <label>
        Email
        <input required type="email" name="email" autoComplete="email" />
      </label>
      <label>
        Password
        <input required type="password" name="password" autoComplete="current-password" />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button className="button">Sign in</button>
    </form>
  );
}
