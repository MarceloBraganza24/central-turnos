"use client";

import { toast } from "sonner";

export default function CopyButton({
  value,
  label = "Copiar",
}: {
  value: string;
  label?: string;
}) {
  async function copy() {
    await navigator.clipboard.writeText(value);
    toast.success("Copiado al portapapeles");
  }

  return (
    <button
      onClick={copy}
      className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] transition hover:bg-[var(--card-soft)] active:scale-[0.98]"
    >
      {label}
    </button>
  );
}