"use client";

import { useState } from "react";
import LoadingButton from "./LoadingButton";

type Props = {
  label: string;
  confirmTitle?: string;
  confirmText?: string;
  loading?: boolean;
  className?: string;
  onConfirm: () => void;
};

export default function ConfirmButton({
  label,
  confirmTitle = "Confirmar acción",
  confirmText = "¿Estás seguro de que querés continuar?",
  loading,
  className = "",
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--card)]/70 p-6">
          <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--background)] p-6 text-[var(--foreground)]">
            <h2 className="text-xl font-bold">{confirmTitle}</h2>

            <p className="mt-2 text-sm text-[var(--muted)]">{confirmText}</p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="min-h-12 flex-1 rounded-xl border border-[var(--border)] px-5 py-3 font-medium text-[var(--foreground)]"
              >
                Cancelar
              </button>

              <LoadingButton
                loading={loading}
                onClick={() => {
                  setOpen(false);
                  onConfirm();
                }}
                className="flex-1 bg-red-600 text-[var(--foreground)] hover:bg-red-700"
              >
                Confirmar
              </LoadingButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}