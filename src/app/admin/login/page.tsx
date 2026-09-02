"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter(); const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const result = await signIn("credentials", { email: data.get("email"), password: data.get("password"), redirect: false }); if (result?.error) setError("Invalid email or password."); else router.replace("/admin"); }
  return <main className="login-wrap"><section className="login-card"><p className="eyebrow">WEZU ADMIN</p><h1>Sign in</h1><form onSubmit={submit}><label>Email<input required type="email" name="email" autoComplete="email" /></label><label>Password<input required type="password" name="password" autoComplete="current-password" /></label>{error && <p className="form-error">{error}</p>}<button className="button">Sign in</button></form></section></main>;
}
