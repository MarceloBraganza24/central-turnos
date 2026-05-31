"use client";

import { useCallback,useEffect, useState } from "react";
import { toast } from "sonner";

type Service = {
  _id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  requiresDeposit: boolean;
  depositAmount: number;
  isActive: boolean;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    durationMinutes: "30",
    price: "0",
    requiresDeposit: false,
    depositAmount: "0",
  });

  const loadServices = useCallback(async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();

      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setServices([]);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadServices();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadServices]);

  async function createService(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const response = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      toast.error(data.message || "Error al crear servicio");
      return;
    }

    toast.success("Servicio creado");

    setForm({
      name: "",
      description: "",
      durationMinutes: "30",
      price: "0",
      requiresDeposit: false,
      depositAmount: "0",
    });

    await loadServices();
  }

  async function toggleService(service: Service) {
    await fetch("/api/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: service._id,
        ...service,
        isActive: !service.isActive,
      }),
    });

    await loadServices();
  }

  return (
    <section className="max-w-7xl text-[var(--foreground)]">
      <h1 className="text-3xl font-bold">Servicios</h1>
      <p className="mt-2 text-[var(--muted)]">
        Creá servicios con precio, duración y seña propia.
      </p>

      <form
        onSubmit={createService}
        className="mt-8 premium-card premium-card-hover premium-gradient rounded-3xl p-6"
      >
        <h2 className="text-xl font-semibold">Nuevo servicio</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">
              Nombre del servicio
            </label>

            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-neutral-700 bg-[var(--background)] px-4 py-3"
              placeholder="Ej: Consulta inicial"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">
              Duración (minutos)
            </label>

            <input
              type="number"
              value={form.durationMinutes}
              onChange={(e) =>
                setForm({ ...form, durationMinutes: e.target.value })
              }
              className="w-full rounded-xl border border-neutral-700 bg-[var(--background)] px-4 py-3"
              placeholder="30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">
              Precio
            </label>

            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              className="w-full rounded-xl border border-neutral-700 bg-[var(--background)] px-4 py-3"
              placeholder="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">
              Monto de seña
            </label>

            <input
              type="number"
              value={form.depositAmount}
              onChange={(e) =>
                setForm({ ...form, depositAmount: e.target.value })
              }
              className="w-full rounded-xl border border-neutral-700 bg-[var(--background)] px-4 py-3"
              placeholder="0"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-neutral-300">
            Descripción
          </label>

          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="min-h-24 w-full rounded-xl border border-neutral-700 bg-[var(--background)] px-4 py-3"
            placeholder="Descripción opcional del servicio"
          />
        </div>

        <label className="mt-4 flex items-center gap-3 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={form.requiresDeposit}
            onChange={(e) =>
              setForm({ ...form, requiresDeposit: e.target.checked })
            }
          />
          Requiere seña
        </label>

        <button
          disabled={saving}
          className="mt-5 rounded-xl bg-brand px-5 py-3 font-medium text-[var(--foreground)] disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Crear servicio"}
        </button>
      </form>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {services.map((service) => (
          <div
            key={service._id}
            className="premium-card premium-card-hover premium-gradient rounded-3xl p-6"
          >
            <p
              className={`inline-flex rounded-full border px-3 py-1 text-xs ${
                service.isActive
                  ? "border-green-900 text-green-400"
                  : "border-yellow-900 text-yellow-400"
              }`}
            >
              {service.isActive ? "Activo" : "Inactivo"}
            </p>

            <h2 className="mt-4 text-xl font-bold">{service.name}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {service.description || "Sin descripción"}
            </p>

            <div className="mt-5 space-y-1 text-sm text-[var(--muted)]">
              <p>{service.durationMinutes} minutos</p>
              <p>${service.price}</p>
              {service.requiresDeposit && <p>Seña: ${service.depositAmount}</p>}
            </div>

            <button
              onClick={() => toggleService(service)}
              className="mt-5 rounded-xl border border-neutral-700 px-4 py-2 text-sm"
            >
              {service.isActive ? "Desactivar" : "Activar"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}