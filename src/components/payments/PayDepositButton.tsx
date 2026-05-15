"use client";

import { toast } from "sonner";

export default function PayDepositButton({
  appointmentId,
}: {
  appointmentId: string;
}) {
  async function pay() {
    const response = await fetch("/api/payments/mercadopago/preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ appointmentId }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Error al iniciar pago");
      return;
    }

    window.location.href = data.initPoint;
  }

  return (
    <button
      onClick={pay}
      className="rounded-xl bg-white px-5 py-3 font-medium text-black"
    >
      Pagar seña
    </button>
  );
}