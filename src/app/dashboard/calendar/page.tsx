"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import MobileCalendarList from "@/components/calendar/MobileCalendarList";
import StatusBadge from "@/components/ui/StatusBadge";
import { useSearchParams } from "next/navigation";

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

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export default function DashboardCalendarPage() {
  const searchParams = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  const [manualForm, setManualForm] = useState({
    appointmentDate: getToday(),
    startTime: "",
    fullName: "",
    phone: "",
    email: "",
    notes: "",
    sendWhatsapp: true,
  });

  const [manualMode, setManualMode] = useState<"available" | "custom">(
    "available"
  );

  const [manualSlots, setManualSlots] = useState<string[]>([]);
  const [loadingManualSlots, setLoadingManualSlots] = useState(false);

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "pending"
  );

  useEffect(() => {
    const appointmentId = searchParams.get("appointment");
    const openFirstPending = searchParams.get("pending") === "true";

    if (!appointmentId && !openFirstPending) return;
    if (appointments.length === 0) return;

    const appointment = appointmentId
      ? appointments.find((item) => item._id === appointmentId)
      : appointments.find((item) => item.status === "pending");

    if (!appointment) return;

    const timer = window.setTimeout(() => {
      setSelectedAppointment(appointment);
      setShowModal(true);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [appointments, searchParams]);

  useEffect(() => {
    async function loadManualSlots() {
      if (!showManualModal || !manualForm.appointmentDate) {
        setManualSlots([]);
        return;
      }

      setLoadingManualSlots(true);

      try {
        const response = await fetch(
          `/api/appointments/manual/available-slots?date=${manualForm.appointmentDate}`
        );

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.message || "Error al cargar horarios");
          setManualSlots([]);
          return;
        }

        setManualSlots(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar horarios disponibles");
        setManualSlots([]);
      } finally {
        setLoadingManualSlots(false);
      }
    }

    void loadManualSlots();
  }, [showManualModal, manualForm.appointmentDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [weekStart]);

  async function loadAppointments() {
    try {
      const response = await fetch("/api/appointments", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Error al cargar turnos");
        setAppointments([]);
        return;
      }

      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      void loadAppointments();
    }, 0);

    const interval = window.setInterval(() => {
      void loadAppointments();
    }, 30000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
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

  async function createManualAppointment(e: React.FormEvent) {
    e.preventDefault();

    const response = await fetch("/api/appointments/manual", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(manualForm),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Error al crear turno");
      return;
    }

    toast.success("Turno creado correctamente");

    setShowManualModal(false);

    setManualForm({
      appointmentDate: getToday(),
      startTime: "",
      fullName: "",
      phone: "",
      email: "",
      notes: "",
      sendWhatsapp: true,
    });

    await loadAppointments();
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
    return <section className="text-[var(--foreground)]">Cargando calendario...</section>;
  }

  return (
    <section className="max-w-7xl text-[var(--foreground)]">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Calendario</h1>
          <p className="mt-2 text-[var(--muted)]">
            Vista semanal de tus turnos reservados.
          </p>
        </div>

        {pendingAppointments.length > 0 && (
          <div className="mt-5 rounded-2xl border border-yellow-300 bg-yellow-50 p-4 text-yellow-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">
                  Tenés {pendingAppointments.length} turno
                  {pendingAppointments.length === 1 ? "" : "s"} pendiente
                  {pendingAppointments.length === 1 ? "" : "s"} de confirmación
                </p>

                <p className="mt-1 text-sm text-yellow-800">
                  Confirmalos o cancelalos cuanto antes para que el cliente no quede esperando.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const firstPending = pendingAppointments[0];

                  setSelectedAppointment(firstPending);
                  setShowModal(true);
                }}
                className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-medium text-yellow-950 hover:bg-yellow-300"
              >
                Ver pendiente
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setManualForm({
                appointmentDate: getToday(),
                startTime: "",
                fullName: "",
                phone: "",
                email: "",
                notes: "",
                sendWhatsapp: true,
              });

              setShowManualModal(true);
            }}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            + Nuevo turno
          </button>
          <a
            href="/dashboard/calendar/settings"
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm bg-brand text-white hover:bg-brand-hover"
          >
            Configuración
          </a>
          <button
            onClick={goToPreviousWeek}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--card)] bg-brand text-white hover:bg-brand-hover"
          >
            Semana anterior
          </button>

          <button
            onClick={goToCurrentWeek}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black bg-brand text-white hover:bg-brand-hover"
          >
            Hoy
          </button>

          <button
            onClick={goToNextWeek}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm bg-brand text-white hover:bg-brand-hover"
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
              className="min-h-96 rounded-2xl border border-[var(--border)] bg-[var(--card)]"
            >
              <div className="border-b border-[var(--border)] p-4">
                <p className="font-semibold">{dayNames[index]}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {formatDate(day)}
                </p>
              </div>

              <div className="space-y-3 p-3">
                {dayAppointments.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">Sin turnos</p>
                ) : (
                  dayAppointments.map((appointment) => (
                    <button
                      key={appointment._id}
                      type="button"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowModal(true);
                      }}
                      className={`w-full rounded-xl border p-3 text-left transition hover:shadow-md ${
                        appointment.status === "pending"
                          ? "border-yellow-300 bg-yellow-50"
                          : "border-[var(--border)] bg-[var(--background)]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 pb-2">
                        <StatusBadge
                          type="appointment"
                          status={appointment.status}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold">
                          {appointment.startTime}
                        </p>
                      </div>

                      <p className="mt-2 text-sm font-medium truncate">
                        {appointment.client?.fullName}
                      </p>

                      <p className="mt-1 text-xs text-black">
                        {appointment.startTime} - {appointment.endTime}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--card)] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Detalle del turno
              </h2>

              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedAppointment(null);
                }}
                className="text-sm text-black"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs text-[var(--muted)]">
                  Cliente
                </p>

                <p className="font-medium">
                  {selectedAppointment.client?.fullName}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--muted)]">
                  Teléfono
                </p>

                <p>{selectedAppointment.client?.phone}</p>
              </div>

              <div>
                <p className="text-xs text-[var(--muted)]">
                  Horario
                </p>

                <p>
                  {selectedAppointment.startTime} -{" "}
                  {selectedAppointment.endTime}
                </p>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <p className="text-xs text-[var(--muted)]">
                    Notas
                  </p>

                  <p>{selectedAppointment.notes}</p>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs text-[var(--muted)]">
                  Estado
                </p>

                <select
                  value={selectedAppointment.status}
                  onChange={(e) =>
                    updateStatus(
                      selectedAppointment._id,
                      e.target.value as Appointment["status"]
                    )
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={createManualAppointment}
            className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl bg-[var(--card)] shadow-2xl"
          >
            {/* Header fijo */}
            <div className="flex items-center justify-between border-b border-[var(--border)] p-6">
              <h2 className="text-xl font-bold">Nuevo turno</h2>

              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="text-sm text-black underline"
              >
                Cerrar
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Fecha
                  </label>

                  <input
                    type="date"
                    value={manualForm.appointmentDate}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        appointmentDate: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Tipo de horario
                  </label>

                  <select
                    value={manualMode}
                    onChange={(e) => {
                      const mode = e.target.value as
                        | "available"
                        | "custom";

                      setManualMode(mode);

                      setManualForm({
                        ...manualForm,
                        startTime: "",
                      });
                    }}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                  >
                    <option value="available">
                      Elegir horario disponible
                    </option>

                    <option value="custom">
                      Ingresar horario manual
                    </option>
                  </select>
                </div>

                {manualMode === "available" ? (
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium">
                      Horarios disponibles
                    </label>

                    {!manualForm.appointmentDate ? (
                      <p className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
                        Primero seleccioná una fecha.
                      </p>
                    ) : loadingManualSlots ? (
                      <p className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
                        Buscando horarios disponibles...
                      </p>
                    ) : manualSlots.length === 0 ? (
                      <p className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
                        No hay horarios disponibles para esta fecha.
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 md:grid-cols-5">
                        {manualSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() =>
                              setManualForm({
                                ...manualForm,
                                startTime: slot,
                              })
                            }
                            className={`rounded-xl border px-3 py-2 text-sm ${
                              manualForm.startTime === slot
                                ? "border-brand bg-brand text-white"
                                : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium">
                      Hora manual
                    </label>

                    <input
                      type="time"
                      value={manualForm.startTime}
                      onChange={(e) =>
                        setManualForm({
                          ...manualForm,
                          startTime: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                    />

                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Usá esta opción para turnos excepcionales fuera de tu disponibilidad habitual.
                    </p>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Nombre del cliente
                  </label>

                  <input
                    value={manualForm.fullName}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                    placeholder="Ej: Camila Braganza"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    WhatsApp
                  </label>

                  <input
                    value={manualForm.phone}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        phone: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                    placeholder="Ej: 5492926459172"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Email opcional
                  </label>

                  <input
                    type="email"
                    value={manualForm.email}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        email: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                    placeholder="cliente@email.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Notas
                  </label>

                  <textarea
                    value={manualForm.notes}
                    onChange={(e) =>
                      setManualForm({
                        ...manualForm,
                        notes: e.target.value,
                      })
                    }
                    className="min-h-24 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                    placeholder="Motivo del turno, aclaraciones, etc."
                  />
                </div>
              </div>

              <label className="mt-5 flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={manualForm.sendWhatsapp}
                  onChange={(e) =>
                    setManualForm({
                      ...manualForm,
                      sendWhatsapp: e.target.checked,
                    })
                  }
                />
                Enviar WhatsApp al cliente con el link de su reserva
              </label>
            </div>

            {/* Footer fijo */}
            <div className="border-t border-[var(--border)] p-6">
              <button
                type="submit"
                className="w-full rounded-xl bg-brand px-5 py-3 font-medium text-white hover:bg-brand-hover"
              >
                Crear turno
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}