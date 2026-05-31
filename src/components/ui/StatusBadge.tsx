type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";
type PaymentStatus = "unpaid" | "pending" | "paid" | "failed";

type StatusBadgeProps = {
  type: "appointment" | "payment";
  status: AppointmentStatus | PaymentStatus;
};

const appointmentStyles = {
  pending: "bg-yellow-950 text-yellow-400 border-yellow-900",
  confirmed: "bg-green-950 text-green-400 border-green-900",
  cancelled: "bg-red-950 text-red-400 border-red-900",
  completed: "bg-blue-950 text-blue-400 border-blue-900",
};

const appointmentLabels = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Completado",
};

const paymentStyles = {
  unpaid: "bg-[var(--card)] text-[var(--muted)] border-neutral-700",
  pending: "bg-yellow-950 text-yellow-400 border-yellow-900",
  paid: "bg-green-950 text-green-400 border-green-900",
  failed: "bg-red-950 text-red-400 border-red-900",
};

const paymentLabels = {
  unpaid: "Sin pago",
  pending: "Pago pendiente",
  paid: "Pagado",
  failed: "Pago fallido",
};

export default function StatusBadge({ type, status }: StatusBadgeProps) {
  const styles =
    type === "appointment"
      ? appointmentStyles[status as AppointmentStatus]
      : paymentStyles[status as PaymentStatus];

  const label =
    type === "appointment"
      ? appointmentLabels[status as AppointmentStatus]
      : paymentLabels[status as PaymentStatus];

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${styles}`}>
      {label}
    </span>
  );
}