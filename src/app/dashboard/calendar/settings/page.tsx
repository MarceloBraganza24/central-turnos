"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type ExceptionType =
  | "vacation"
  | "holiday"
  | "manual_block"
  | "special_hours";

type ScheduleException = {
  _id: string;
  date: string;
  type: ExceptionType;
  isWorkingDay: boolean;
  startTime?: string;
  endTime?: string;
  reason?: string;
};

const typeLabels: Record<ExceptionType, string> = {
  vacation: "Vacaciones",
  holiday: "Feriado",
  manual_block: "Bloqueo rápido",
  special_hours: "Horario especial",
};

const typeDescriptions: Record<ExceptionType, string> = {
  vacation: "Día completo sin atención.",
  holiday: "Feriado o día no laborable.",
  manual_block: "Bloqueá una franja horaria puntual.",
  special_hours: "Reemplaza el horario habitual de ese día.",
};

export default function CalendarSettingsPage() {
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingBuffer, setSavingBuffer] = useState(false);
  const [savingException, setSavingException] = useState(false);

  const [bufferMinutes, setBufferMinutes] = useState("0");

  const [form, setForm] = useState({
    date: "",
    type: "vacation" as ExceptionType,
    startTime: "09:00",
    endTime: "12:00",
    reason: "",
  });

  async function loadData() {
    const [settingsRes, exceptionsRes] = await Promise.all([
      fetch("/api/calendar-settings"),
      fetch("/api/schedule-exceptions"),
    ]);

    const settingsData = await settingsRes.json();
    const exceptionsData = await exceptionsRes.json();

    if (settingsRes.ok) {
      setBufferMinutes(String(settingsData.appointmentBufferMinutes || 0));
    }

    if (exceptionsRes.ok) {
      setExceptions(Array.isArray(exceptionsData) ? exceptionsData : []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function saveBuffer(e: React.FormEvent) {
    e.preventDefault();

    setSavingBuffer(true);

    const response = await fetch("/api/calendar-settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appointmentBufferMinutes: Number(bufferMinutes) || 0,
      }),
    });

    const data = await response.json();

    setSavingBuffer(false);

    if (!response.ok) {
      toast.error(data.message || "Error al guardar buffer");
      return;
    }

    toast.success("Buffer actualizado");
  }

  async function createException(e: React.FormEvent) {
    e.preventDefault();

    if (!form.date) {
      toast.error("Seleccioná una fecha");
      return;
    }

    const needsTime =
      form.type === "manual_block" || form.type === "special_hours";

    if (needsTime && form.startTime >= form.endTime) {
      toast.error("La hora de inicio debe ser menor a la hora de fin");
      return;
    }

    setSavingException(true);

    const response = await fetch("/api/schedule-exceptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: form.date,
        type: form.type,
        isWorkingDay: form.type === "special_hours",
        startTime: needsTime ? form.startTime : "",
        endTime: needsTime ? form.endTime : "",
        reason: form.reason,
      }),
    });

    const data = await response.json();

    setSavingException(false);

    if (!response.ok) {
      toast.error(data.message || "Error al crear excepción");
      return;
    }

    toast.success("Configuración agregada");

    setForm({
      date: "",
      type: "vacation",
      startTime: "09:00",
      endTime: "12:00",
      reason: "",
    });

    await loadData();
  }

  async function deleteException(id: string) {
    const confirmDelete = confirm("¿Eliminar esta configuración?");

    if (!confirmDelete) return;

    const response = await fetch(`/api/schedule-exceptions?id=${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Error al eliminar");
      return;
    }

    toast.success("Configuración eliminada");
    await loadData();
  }

  if (loading) {
    return <section className="text-white">Cargando configuración...</section>;
  }

  const needsTime =
    form.type === "manual_block" || form.type === "special_hours";

  return (
    <section className="max-w-7xl text-white">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold">Configuración de calendario</h1>
          <p className="mt-2 text-neutral-400">
            Administrá vacaciones, feriados, horarios especiales, buffers y
            bloqueos puntuales.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <form
            onSubmit={saveBuffer}
            className="premium-card premium-gradient rounded-3xl p-6"
          >
            <h2 className="text-xl font-semibold">Buffer entre turnos</h2>

            <p className="mt-2 text-sm text-neutral-400">
              Tiempo extra entre un turno y el siguiente. Sirve para limpiar,
              descansar o preparar la próxima atención.
            </p>

            <div className="mt-5">
              <label className="mb-2 block text-sm text-neutral-300">
                Minutos de buffer
              </label>

              <input
                type="number"
                min={0}
                value={bufferMinutes}
                onChange={(e) => setBufferMinutes(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
                placeholder="Ej: 15"
              />
            </div>

            <button
              disabled={savingBuffer}
              className="mt-5 w-full rounded-xl bg-white py-3 font-medium text-black disabled:opacity-60"
            >
              {savingBuffer ? "Guardando..." : "Guardar buffer"}
            </button>
          </form>

          <form
            onSubmit={createException}
            className="premium-card rounded-3xl p-6"
          >
            <h2 className="text-xl font-semibold">Nueva excepción</h2>

            <p className="mt-2 text-sm text-neutral-400">
              Configurá un día especial, vacaciones, feriados o bloqueos
              rápidos.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  Tipo
                </label>

                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as ExceptionType,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
                >
                  <option value="vacation">Vacaciones / día libre</option>
                  <option value="holiday">Feriado</option>
                  <option value="special_hours">Horario especial</option>
                  <option value="manual_block">Bloqueo rápido</option>
                </select>

                <p className="mt-2 text-xs text-neutral-500">
                  {typeDescriptions[form.type]}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  Fecha
                </label>

                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
                />
              </div>

              {needsTime && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-neutral-300">
                      Desde
                    </label>

                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          startTime: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-neutral-300">
                      Hasta
                    </label>

                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          endTime: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  Motivo / nota
                </label>

                <input
                  value={form.reason}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      reason: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
                  placeholder="Ej: vacaciones, feriado, trámite, capacitación..."
                />
              </div>
            </div>

            <button
              disabled={savingException}
              className="mt-5 w-full rounded-xl bg-white py-3 font-medium text-black disabled:opacity-60"
            >
              {savingException ? "Guardando..." : "Agregar configuración"}
            </button>
          </form>
        </div>

        <div className="premium-card rounded-3xl p-6">
          <h2 className="text-xl font-semibold">Configuraciones cargadas</h2>

          <p className="mt-2 text-sm text-neutral-400">
            Estas reglas modifican la disponibilidad real del calendario.
          </p>

          <div className="mt-6 space-y-3">
            {exceptions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950 p-8 text-center">
                <p className="font-medium">Sin excepciones cargadas</p>
                <p className="mt-2 text-sm text-neutral-500">
                  Cuando agregues vacaciones, feriados o bloqueos, van a
                  aparecer acá.
                </p>
              </div>
            ) : (
              exceptions.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <span className="inline-flex rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                        {typeLabels[item.type]}
                      </span>

                      <h3 className="mt-3 text-lg font-semibold">
                        {item.date}
                      </h3>

                      {(item.type === "manual_block" ||
                        item.type === "special_hours") && (
                        <p className="mt-1 text-sm text-neutral-400">
                          {item.startTime} a {item.endTime}
                        </p>
                      )}

                      {item.reason && (
                        <p className="mt-2 text-sm text-neutral-500">
                          {item.reason}
                        </p>
                      )}

                      {item.type === "special_hours" && (
                        <p className="mt-2 text-xs text-green-400">
                          Este día reemplaza el horario habitual.
                        </p>
                      )}

                      {(item.type === "vacation" ||
                        item.type === "holiday") && (
                        <p className="mt-2 text-xs text-red-400">
                          Este día queda sin atención.
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => deleteException(item._id)}
                      className="rounded-xl border border-red-900 px-4 py-2 text-sm text-red-400 transition hover:bg-red-950"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}