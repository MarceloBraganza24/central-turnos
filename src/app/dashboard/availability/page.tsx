"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

const days = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

type Availability = {
  _id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    dayOfWeek: "1",
    startTime: "09:00",
    endTime: "12:00",
  });

  async function loadAvailability() {
    const response = await fetch("/api/availability");
    const data = await response.json();

    setAvailability(data);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      try {
        await loadAvailability();
      } catch (error) {
        console.error(error);
      }
    }

    init();
  }, []);

  function getDayName(dayOfWeek: number) {
    return days.find((day) => day.value === dayOfWeek)?.label || "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    const response = await fetch("/api/availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dayOfWeek: Number(form.dayOfWeek),
        startTime: form.startTime,
        endTime: form.endTime,
      }),
    });

    const data = await response.json();

    setSaving(false);

    if (!response.ok) {
      toast.error(data.message || "Error al guardar horario");
      return;
    }

    setForm({
      dayOfWeek: "1",
      startTime: "09:00",
      endTime: "12:00",
    });

    await loadAvailability();
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm("¿Eliminar este horario?");

    if (!confirmDelete) return;

    const response = await fetch(`/api/availability?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      toast.error("Error al eliminar horario");
      return;
    }

    await loadAvailability();
  }

  if (loading) {
    return (
      <main className="max-w-6xl">
        Cargando horarios...
      </main>
    );
  }

  return (
    <main className="max-w-6xl">
      <section className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Horarios disponibles</h1>

        <p className="mt-2 text-neutral-400">
          Cargá los días y horarios en los que atendés. Más adelante, el sistema
          usará estos rangos para generar turnos automáticamente.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 md:grid-cols-4"
        >
          <div>
            <label className="mb-2 block text-sm text-neutral-300">Día</label>
            <select
              value={form.dayOfWeek}
              onChange={(e) =>
                setForm({ ...form, dayOfWeek: e.target.value })
              }
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
            >
              {days.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">
              Desde
            </label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) =>
                setForm({ ...form, startTime: e.target.value })
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
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
            />
          </div>

          <div className="flex items-end">
            <button
              disabled={saving}
              className="w-full rounded-xl bg-white py-3 font-medium text-black disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Agregar"}
            </button>
          </div>
        </form>

        <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900">
          <div className="border-b border-neutral-800 p-5">
            <h2 className="font-semibold">Mis horarios cargados</h2>
          </div>

          {availability.length === 0 ? (
            <p className="p-5 text-sm text-neutral-400">
              Todavía no cargaste horarios.
            </p>
          ) : (
            <div className="divide-y divide-neutral-800">
              {availability.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div>
                    <p className="font-medium">{getDayName(item.dayOfWeek)}</p>
                    <p className="text-sm text-neutral-400">
                      {item.startTime} a {item.endTime}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="rounded-xl border border-red-900 px-4 py-2 text-sm text-red-400 transition hover:bg-red-950"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}