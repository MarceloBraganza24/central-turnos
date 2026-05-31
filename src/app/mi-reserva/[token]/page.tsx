import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";
import "@/models/Client";
import "@/models/Professional";
import "@/models/Service";
import "@/models/Tenant";

export const runtime = "nodejs";

type Props = {
  params: Promise<{
    token: string;
  }>;
};

type PopulatedAppointment = {
  _id: string;
  publicToken: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus?: "unpaid" | "pending" | "paid" | "failed";
  notes?: string;
  client?: {
    fullName?: string;
    phone?: string;
    email?: string;
  };
  professional?: {
    displayName?: string;
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
  };
  service?: {
    name?: string;
    durationMinutes?: number;
    price?: number;
  };
  tenant?: {
    name?: string;
    address?: string;
    city?: string;
    province?: string;
    logoUrl?: string;
    cancellationPolicy?: string;
    welcomeMessage?: string;
  };
};

function getStatusLabel(status: PopulatedAppointment["status"]) {
  const labels = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    cancelled: "Cancelado",
    completed: "Completado",
  };

  return labels[status] || status;
}

function getPaymentLabel(status?: PopulatedAppointment["paymentStatus"]) {
  const labels = {
    unpaid: "Sin pago",
    pending: "Pago pendiente",
    paid: "Pagado",
    failed: "Pago fallido",
  };

  return status ? labels[status] || status : "Sin pago";
}

function buildGoogleCalendarUrl(appointment: PopulatedAppointment) {
  const title = encodeURIComponent(
    `Turno con ${appointment.professional?.displayName || "profesional"}`
  );

  const details = encodeURIComponent(
    `Turno reservado en Central Turnos. Estado: ${getStatusLabel(
      appointment.status
    )}`
  );

  const location = encodeURIComponent(
    [
      appointment.professional?.address,
      appointment.professional?.city,
      appointment.professional?.province,
    ]
      .filter(Boolean)
      .join(", ")
  );

  const start = `${appointment.appointmentDate.replaceAll(
    "-",
    ""
  )}T${appointment.startTime.replace(":", "")}00`;

  const end = `${appointment.appointmentDate.replaceAll(
    "-",
    ""
  )}T${appointment.endTime.replace(":", "")}00`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

export default async function ClientReservationPage({ params }: Props) {
  const { token } = await params;

  await connectDB();

  const appointment = (await Appointment.findOne({
    publicToken: token,
  })
    .populate("client")
    .populate("professional")
    .populate("service")
    .populate("tenant")
    .lean()) as PopulatedAppointment | null;

  if (!appointment) {
    notFound();
  }

  const calendarUrl = buildGoogleCalendarUrl(appointment);

  const whatsappText = encodeURIComponent(
    `Hola, te comparto mi turno:

Profesional: ${appointment.professional?.displayName || "-"}
Fecha: ${appointment.appointmentDate}
Horario: ${appointment.startTime} a ${appointment.endTime}
Estado: ${getStatusLabel(appointment.status)}`
  );

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)]">
      <section className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-[var(--muted)] underline">
          Volver al inicio
        </Link>

        <div className="premium-card premium-gradient mt-6 rounded-3xl p-8">
          <p className="text-sm text-brand">Central Turnos</p>

          <h1 className="mt-4 text-4xl font-bold">
            Detalle de tu reserva
          </h1>

          <p className="mt-3 text-[var(--muted)]">
            Guardá este enlace para volver a consultar tu turno cuando lo
            necesites.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-[var(--background)] p-5">
              <p className="text-sm text-neutral-500">Estado</p>
              <p className="mt-1 text-2xl font-bold">
                {getStatusLabel(appointment.status)}
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--background)] p-5">
              <p className="text-sm text-neutral-500">Pago</p>
              <p className="mt-1 text-2xl font-bold">
                {getPaymentLabel(appointment.paymentStatus)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="premium-card rounded-3xl p-6">
            <h2 className="text-2xl font-bold">Resumen del turno</h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-[var(--background)] p-4">
                <p className="text-sm text-neutral-500">Profesional</p>
                <p className="mt-1 font-medium">
                  {appointment.professional?.displayName || "-"}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-[var(--background)] p-4">
                  <p className="text-sm text-neutral-500">Fecha</p>
                  <p className="mt-1 font-medium">
                    {appointment.appointmentDate}
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--background)] p-4">
                  <p className="text-sm text-neutral-500">Horario</p>
                  <p className="mt-1 font-medium">
                    {appointment.startTime} a {appointment.endTime}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[var(--background)] p-4">
                <p className="text-sm text-neutral-500">Servicio</p>
                <p className="mt-1 font-medium">
                  {appointment.service?.name || "Turno"}
                </p>
              </div>

              <div className="rounded-2xl bg-[var(--background)] p-4">
                <p className="text-sm text-neutral-500">Cliente</p>
                <p className="mt-1 font-medium">
                  {appointment.client?.fullName || "-"}
                </p>
                {appointment.client?.phone && (
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {appointment.client.phone}
                  </p>
                )}
              </div>

              {appointment.notes && (
                <div className="rounded-2xl bg-[var(--background)] p-4">
                  <p className="text-sm text-neutral-500">Comentario</p>
                  <p className="mt-1 text-sm text-neutral-300">
                    {appointment.notes}
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="premium-card rounded-3xl p-6">
              <h2 className="text-xl font-bold">Acciones</h2>

              <div className="mt-5 space-y-3">
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl bg-white px-5 py-3 text-center font-medium text-black"
                >
                  Agregar a Google Calendar
                </a>

                <a
                  href={`https://wa.me/?text=${whatsappText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-neutral-700 px-5 py-3 text-center font-medium text-[var(--foreground)] hover:bg-[var(--card)]"
                >
                  Compartir por WhatsApp
                </a>

                {appointment.professional?.phone && (
                  <a
                    href={`https://wa.me/${appointment.professional.phone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-neutral-700 px-5 py-3 text-center font-medium text-[var(--foreground)] hover:bg-[var(--card)]"
                  >
                    Escribir al profesional
                  </a>
                )}
              </div>
            </div>

            <div className="premium-card rounded-3xl p-6">
              <h2 className="text-xl font-bold">Ubicación</h2>

              <p className="mt-3 text-sm text-[var(--muted)]">
                {[
                  appointment.professional?.address,
                  appointment.professional?.city,
                  appointment.professional?.province,
                ]
                  .filter(Boolean)
                  .join(", ") || "Ubicación no informada"}
              </p>
            </div>

            {appointment.tenant?.cancellationPolicy && (
              <div className="premium-card rounded-3xl p-6">
                <h2 className="text-xl font-bold">
                  Política de cancelación
                </h2>

                <p className="mt-3 text-sm text-[var(--muted)]">
                  {appointment.tenant.cancellationPolicy}
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}