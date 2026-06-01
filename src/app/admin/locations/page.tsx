"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Location = {
  _id: string;
  city: string;
  province: string;
  country: string;
  isActive: boolean;
};

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [form, setForm] = useState({
    city: "",
    province: "",
    country: "Argentina",
  });

  const loadLocations = useCallback(async () => {
    const response = await fetch("/api/admin/locations");
    const data = await response.json();
    setLocations(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadLocations();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadLocations]);

  async function createLocation(e: React.FormEvent) {
    e.preventDefault();

    const response = await fetch("/api/admin/locations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Error al crear localidad");
      return;
    }

    toast.success("Localidad creada");

    setForm({
      city: "",
      province: "",
      country: "Argentina",
    });

    await loadLocations();
  }

  async function toggleLocation(location: Location) {
    await fetch("/api/admin/locations", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locationId: location._id,
        isActive: !location.isActive,
      }),
    });

    await loadLocations();
  }

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 text-[var(--foreground)]">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Localidades</h1>

        <p className="mt-2 text-[var(--muted)]">
          Cargá ciudades manualmente para que aparezcan en la búsqueda pública.
        </p>

        <form
          onSubmit={createLocation}
          className="premium-card mt-8 grid gap-4 rounded-3xl p-6 md:grid-cols-4"
        >
          <input
            value={form.province}
            onChange={(e) =>
              setForm({ ...form, province: e.target.value })
            }
            placeholder="Provincia"
            className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
          />

          <input
            value={form.city}
            onChange={(e) =>
              setForm({ ...form, city: e.target.value })
            }
            placeholder="Ciudad"
            className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
          />

          <input
            value={form.country}
            onChange={(e) =>
              setForm({ ...form, country: e.target.value })
            }
            placeholder="País"
            className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
          />

          <button className="rounded-xl bg-brand px-5 py-3 font-medium text-[var(--foreground)] hover:bg-brand-hover">
            Crear localidad
          </button>
        </form>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {locations.map((location) => (
            <div
              key={location._id}
              className="premium-card premium-card-hover rounded-3xl p-6"
            >
              <p
                className={`inline-flex rounded-full border px-3 py-1 text-xs ${
                  location.isActive
                    ? "border-green-900 text-green-400"
                    : "border-yellow-900 text-yellow-400"
                }`}
              >
                {location.isActive ? "Activa" : "Inactiva"}
              </p>

              <h2 className="mt-4 text-xl font-bold">
                {location.city}
              </h2>

              <p className="mt-1 text-sm text-[var(--muted)]">
                {location.province}, {location.country}
              </p>

              <button
                onClick={() => toggleLocation(location)}
                className="mt-5 rounded-xl border border-[var(--border)] px-4 py-2 text-sm text-neutral-300 hover:bg-[var(--card)]"
              >
                {location.isActive ? "Desactivar" : "Activar"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}