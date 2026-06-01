"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

type ShareData = {
  publicUrl: string;
  qr: string;
};

export default function ShareProfilePage() {
  const [data, setData] = useState<ShareData | null>(null);

  useEffect(() => {
    async function loadQr() {
      const response = await fetch("/api/professional-profile");
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Error al generar QR");
        return;
      }

      setData(result);
    }

    loadQr();
  }, []);

  async function copyLink() {
    if (!data?.publicUrl) return;

    await navigator.clipboard.writeText(data.publicUrl);
    toast.success("Link copiado");
  }

  return (
    <section className="max-w-4xl text-[var(--foreground)]">
      <h1 className="text-3xl font-bold">Compartir perfil</h1>

      <p className="mt-2 text-[var(--muted)]">
        Compartí tu link público o usá el QR en historias, Instagram, tarjetas o
        consultorio.
      </p>

      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        {!data ? (
          <p className="text-[var(--muted)]">Generando QR...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-[260px_1fr]">
            <div className="rounded-2xl bg-white p-4">
              <Image
                src={data.qr}
                alt="QR del perfil público"
                width={220}
                height={220}
                className="rounded-2xl"
              />
            </div>

            <div>
              <p className="text-sm text-black">Link público</p>
              <p className="mt-2 break-all rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-black">
                {data.publicUrl}
              </p>

              <button
                onClick={copyLink}
                className="mt-4 rounded-xl bg-brand px-5 py-3 font-medium text-white  hover:bg-brand-hover"
              >
                Copiar link
              </button>

              <a
                href={data.qr}
                download="perfil-qr.png"
                className="ml-3 inline-flex rounded-xl border bg-brand border-[var(--border)] text-white  hover:bg-brand-hover px-5 py-3 font-medium text-[var(--foreground)]"
              >
                Descargar QR
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}