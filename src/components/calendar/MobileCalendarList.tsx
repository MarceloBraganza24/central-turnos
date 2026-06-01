"use client";

import StatusBadge from "@/components/ui/StatusBadge";

type Client = {
  fullName: string;
  phone: string;
};

type Appointment = {
  _id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus?: "unpaid" | "pending" | "paid" | "failed";
  notes?: string;
  client: Client;
};

type Props = {
  appointments: Appointment[];
  weekDays: Date[];
  onStatusChange: (
    appointmentId: string,
    status: Appointment["status"]
  ) => void;
  updatingId: string | null;
};

const dayNames = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export default function MobileCalendarList({
  appointments,
  weekDays,
  onStatusChange,
  updatingId,
}: Props) {
  return (
    <div className="space-y-4 lg:hidden">
      {weekDays.map((day, index) => {
        const formattedDate = formatDate(day);

        const dayAppointments = appointments.filter(
          (appointment) => appointment.appointmentDate === formattedDate
        );

        return (
          <div
            key={formattedDate}
            className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{dayNames[index]}</p>
                <p className="text-sm text-[var(--muted)]">{formattedDate}</p>
              </div>

              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                {dayAppointments.length} turnos
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {dayAppointments.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
                  Sin turnos
                </p>
              ) : (
                dayAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xl font-bold">
                          {appointment.startTime}
                        </p>
                        <p className="text-sm text-[var(--muted)]">
                          hasta {appointment.endTime}
                        </p>
                      </div>

                      <StatusBadge
                        type="appointment"
                        status={appointment.status}
                      />
                    </div>

                    <div className="mt-4">
                      <p className="font-medium">
                        {appointment.client?.fullName}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {appointment.client?.phone}
                      </p>
                    </div>

                    {appointment.notes && (
                      <p className="mt-3 rounded-xl bg-[var(--card)] p-3 text-sm text-[var(--muted)]">
                        {appointment.notes}
                      </p>
                    )}

                    <select
                      value={appointment.status}
                      disabled={updatingId === appointment._id}
                      onChange={(e) =>
                        onStatusChange(
                          appointment._id,
                          e.target.value as Appointment["status"]
                        )
                      }
                      className="mt-4 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] disabled:opacity-60"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmado</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}