"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-white bg-brand hover:bg-brand-hover"
    >
      Salir
    </button>
  );
}