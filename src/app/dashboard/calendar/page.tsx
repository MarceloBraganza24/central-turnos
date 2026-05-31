"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import MobileCalendarList from "@/components/calendar/MobileCalendarList";
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

function getMonday(date: Date) {
  const current = new Date(date);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);

  current.setDate(diff);
  current.setHours(0, 0, 0, 0);

  return current;
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const dayNames = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export default function DashboardCalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [weekStart]);

  async function loadAppointments() {
    const response = await fetch("/api/appointments");
    const data = await response.json();

    setAppointments(
      Array.isArray(data) ? data : []
    );
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      try {
        await loadAppointments();
      } catch (error) {
        console.error(error);
      }
    }

    init();
  }, []);

  async function updateStatus(appointmentId: string, status: Appointment["status"]) {
    setUpdatingId(appointmentId);

    const response = await fetch("/api/appointments", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appointmentId,
        status,
      }),
    });

    setUpdatingId(null);

    if (!response.ok) {
      toast.error("Error al actualizar el turno");
      return;
    }

    toast.success("Estado actualizado");

    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment._id === appointmentId
          ? { ...appointment, status }
          : appointment
      )
    );
  }

  function getAppointmentsByDate(date: Date) {
    const formattedDate = formatDate(date);

    return appointments.filter(
      (appointment) => appointment.appointmentDate === formattedDate
    );
  }

  function goToPreviousWeek() {
    setWeekStart(addDays(weekStart, -7));
  }

  function goToNextWeek() {
    setWeekStart(addDays(weekStart, 7));
  }

  function goToCurrentWeek() {
    setWeekStart(getMonday(new Date()));
  }

  if (loading) {
    return <section className="text-white">Cargando calendario...</section>;
  }

  return (
    <section className="max-w-7xl text-white">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Calendario</h1>
          <p className="mt-2 text-neutral-400">
            Vista semanal de tus turnos reservados.
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href="/dashboard/calendar/settings"
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900"
          >
            Configuración
          </a>
          <button
            onClick={goToPreviousWeek}
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900"
          >
            Semana anterior
          </button>

          <button
            onClick={goToCurrentWeek}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Hoy
          </button>

          <button
            onClick={goToNextWeek}
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900"
          >
            Semana siguiente
          </button>
        </div>
      </div>

      <div className="mt-8">
        <MobileCalendarList
          appointments={appointments}
          weekDays={weekDays}
          onStatusChange={updateStatus}
          updatingId={updatingId}
        />
      </div>

      <div className="mt-8 hidden gap-4 lg:grid lg:grid-cols-7">
        {weekDays.map((day, index) => {
          const dayAppointments = getAppointmentsByDate(day);

          return (
            <div
              key={formatDate(day)}
              className="min-h-96 rounded-2xl border border-neutral-800 bg-neutral-900"
            >
              <div className="border-b border-neutral-800 p-4">
                <p className="font-semibold">{dayNames[index]}</p>
                <p className="mt-1 text-sm text-neutral-400">
                  {formatDate(day)}
                </p>
              </div>

              <div className="space-y-3 p-3">
                {dayAppointments.length === 0 ? (
                  <p className="text-sm text-neutral-500">Sin turnos</p>
                ) : (
                  dayAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="rounded-xl border border-neutral-800 bg-neutral-950 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold">
                          {appointment.startTime}
                        </p>

                        <StatusBadge
                          type="appointment"
                          status={appointment.status}
                        />
                      </div>

                      <p className="mt-2 text-sm font-medium">
                        {appointment.client?.fullName}
                      </p>

                      <p className="text-xs text-neutral-500">
                        {appointment.startTime} a {appointment.endTime}
                      </p>

                      <p className="mt-1 text-xs text-neutral-400">
                        {appointment.client?.phone}
                      </p>

                      {appointment.notes && (
                        <p className="mt-2 line-clamp-2 text-xs text-neutral-500">
                          {appointment.notes}
                        </p>
                      )}

                      <div className="mt-3">
                        <label className="mb-1 block text-xs text-neutral-500">
                          Cambiar estado
                        </label>

                        <select
                          value={appointment.status}
                          disabled={updatingId === appointment._id}
                          onChange={(e) =>
                            updateStatus(
                              appointment._id,
                              e.target.value as Appointment["status"]
                            )
                          }
                          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-white disabled:opacity-60"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="confirmed">Confirmado</option>
                          <option value="completed">Completado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}