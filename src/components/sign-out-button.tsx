"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button className="button" onClick={() => signOut({ callbackUrl: "/admin/login" })}>
      Sign out
    </button>
  );
}
