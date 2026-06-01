"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (response?.error) {
      toast.error("Email o contraseña incorrectos");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 text-[var(--foreground)]">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl border bg-brand border-[var(--border)] bg-[var(--card)] p-6"
      >
        <h1 className="text-2xl font-bold text-white">Iniciar sesión</h1>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full rounded-xl bg-white py-3 font-medium text-black">
            Entrar
          </button>
        </div>

        <p className="mt-4 text-sm text-white">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="text-white underline">
            Registrate
          </Link>
        </p>
      </form>
    </main>
  );
}