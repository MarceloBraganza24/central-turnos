"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fullName, email, password, phone }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Error al crear la cuenta");
      return;
    }

    const loginResponse = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (loginResponse?.error) {
      toast.success("Cuenta creada. Iniciá sesión para continuar.");
      router.push("/login");
      return;
    }

    router.push("/dashboard/onboarding");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 text-[var(--foreground)]">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-brand rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
      >
        <h1 className="text-2xl font-bold text-white">Crear cuenta profesional</h1>

        <p className="mt-2 text-sm text-white">
          Creá tu cuenta y configurá tu perfil en minutos.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            autoComplete="name"
            placeholder="Nombre completo"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            type="email"
            autoComplete="email"
            placeholder="Email"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="WhatsApp. Ej: 5492926..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full rounded-xl bg-white py-3 font-medium text-black">
            Crear cuenta
          </button>
        </div>

        <p className="mt-4 text-sm text-white">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-white underline">
            Iniciá sesión
          </Link>
        </p>
      </form>
    </main>
  );
}