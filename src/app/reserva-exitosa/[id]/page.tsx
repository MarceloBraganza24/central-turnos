import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";
import PayDepositButton from "@/components/payments/PayDepositButton";
import StatusBadge from "@/components/ui/StatusBadge";
import "@/models/Professional";
import "@/models/Client";
import "@/models/Service";
import "@/models/Category";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ id: string }>;
};

type PopulatedClient = {
  _id: string;
  fullName: string;
  phone?: string;
  email?: string;
};

type PopulatedProfessional = {
  _id: string;
  displayName: string;
  slug?: string;
  address?: string;
  city?: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
};

type PopulatedAppointment = {
  _id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus?: "unpaid" | "pending" | "paid" | "failed";
  depositAmount?: number;
  serviceName?: string;
  servicePrice?: number;
  serviceDurationMinutes?: number;
  client: PopulatedClient;
  professional: PopulatedProfessional;
};

function formatGoogleCalendarDate(date: string, time: string) {
  const cleanDate = date.replaceAll("-", "");
  const cleanTime = time.replace(":", "");

  return `${cleanDate}T${cleanTime}00`;
}

export default async function ReservationSuccessPage({ params }: Props) {
  const { id } = await params;

  await connectDB();

  const appointment = await Appointment.findById(id)
    .populate("client")
    .populate({
      path: "professional",
      populate: {
        path: "category",
      },
    })
    .lean<PopulatedAppointment>();

  if (!appointment) {
    notFound();
  }

  const client = appointment.client;
  const professional = appointment.professional;

  const title = `Turno con ${professional.displayName}`;
  const details = `Turno reservado mediante Turnero Pro. Cliente: ${client.fullName}. Teléfono: ${client.phone}.`;
  const location = professional.address || professional.city || "";

  const start = formatGoogleCalendarDate(
    appointment.appointmentDate,
    appointment.startTime
  );

  const end = formatGoogleCalendarDate(
    appointment.appointmentDate,
    appointment.endTime
  );

  const googleCalendarUrl =
    `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${start}/${end}` +
    `&details=${encodeURIComponent(details)}` +
    `&location=${encodeURIComponent(location)}`;

  const whatsappMessage = `Hola, reservé un turno con ${professional.displayName} para el día ${appointment.appointmentDate} a las ${appointment.startTime}. Mi nombre es ${client.fullName}.`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 text-[var(--foreground)]">
      <section className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
        <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-3xl text-black">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Turno reservado correctamente
          </h1>

          <p className="mt-3 text-[var(--muted)]">
            Te dejamos el detalle de la reserva para que puedas guardarla o
            compartirla.
          </p>

          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 text-left">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-sm text-neutral-500">Profesional</p>
                <p className="mt-1 font-medium">
                  {professional.displayName}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {professional.category?.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Cliente</p>
                <p className="mt-1 font-medium">{client.fullName}</p>
                <p className="text-sm text-[var(--muted)]">{client.phone}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Fecha</p>
                <p className="mt-1 font-medium">
                  {appointment.appointmentDate}
                </p>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Horario</p>
                <p className="mt-1 font-medium">
                  {appointment.startTime} a {appointment.endTime}
                </p>
              </div>

              {location && (
                <div className="md:col-span-2">
                  <p className="text-sm text-neutral-500">Ubicación</p>
                  <p className="mt-1 font-medium">{location}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-neutral-500">Pago</p>
                <StatusBadge
                  type="payment"
                  status={appointment.paymentStatus || "unpaid"}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <a
              href={googleCalendarUrl}
              target="_blank"
              className="rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-neutral-200"
            >
              Agregar a Google Calendar
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              className="rounded-xl border border-neutral-700 px-5 py-3 font-medium text-[var(--foreground)] transition hover:bg-neutral-800"
            >
              Compartir por WhatsApp
            </a>
          </div>

          {(appointment.depositAmount ?? 0) > 0 && appointment.paymentStatus !== "paid" && (
            <div className="mt-4">
              <PayDepositButton appointmentId={appointment._id.toString()} />
            </div>
          )}

          <Link
            href="/categorias"
            className="mt-6 inline-flex text-sm text-[var(--muted)] underline"
          >
            Volver a categorías
          </Link>
        </div>
      </section>
    </main>
  );
}