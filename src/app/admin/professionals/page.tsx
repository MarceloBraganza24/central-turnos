"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Plan = "free" | "pro" | "premium";

type Professional = {
  _id: string;
  displayName: string;
  bio?: string;
  phone?: string;
  city?: string;
  province?: string;
  price?: number;
  isActive: boolean;
  createdAt: string;
  user?: {
    _id: string;
    fullName: string;
    email: string;
    plan?: Plan;
  };
  category?: {
    name: string;
  };
};

const planLabels = {
  free: "Free",
  pro: "Pro",
  premium: "Premium",
};

export default function AdminProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadProfessionals() {
    const response = await fetch("/api/admin/professionals");
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "No autorizado");
      setLoading(false);
      return;
    }

    setProfessionals(data);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      try {
        await loadProfessionals();
      } catch (error) {
        console.error(error);
      }
    }

    init();
  }, []);

  async function updateProfessionalStatus(
    professionalId: string,
    isActive: boolean
  ) {
    setUpdatingId(professionalId);

    const response = await fetch("/api/admin/professionals", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        professionalId,
        isActive,
      }),
    });

    const data = await response.json();

    setUpdatingId(null);

    if (!response.ok) {
      toast.error(data.message || "Error al actualizar profesional");
      return;
    }

    toast.success(data.message);
    await loadProfessionals();
  }

  async function updatePlan(userId: string, plan: Plan) {
    setUpdatingId(userId);

    const response = await fetch("/api/admin/plans", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        plan,
      }),
    });

    const data = await response.json();

    setUpdatingId(null);

    if (!response.ok) {
      toast.error(data.message || "Error al actualizar plan");
      return;
    }

    toast.success("Plan actualizado");
    await loadProfessionals();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] p-6 text-[var(--foreground)]">
        Cargando profesionales...
      </main>
    );
  }

  const pendingCount = professionals.filter((item) => !item.isActive).length;
  const activeCount = professionals.filter((item) => item.isActive).length;

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 text-[var(--foreground)]">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold">Profesionales</h1>

            <p className="mt-2 text-[var(--muted)]">
              Aprobá profesionales, desactivalos o cambiá su plan comercial.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-3">
              <p className="text-xs text-neutral-500">Activos</p>
              <p className="text-xl font-bold">{activeCount}</p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-3">
              <p className="text-xs text-neutral-500">Pendientes</p>
              <p className="text-xl font-bold">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          {professionals.length === 0 ? (
            <p className="p-6 text-[var(--muted)]">
              Todavía no hay profesionales registrados.
            </p>
          ) : (
            <div className="divide-y divide-neutral-800">
              {professionals.map((professional) => (
                <div
                  key={professional._id}
                  className="grid gap-5 p-5 md:grid-cols-[1.4fr_1fr_0.9fr_1fr]"
                >
                  <div>
                    <p className="text-sm text-neutral-500">Profesional</p>

                    <p className="mt-1 font-medium">
                      {professional.displayName}
                    </p>

                    <p className="text-sm text-[var(--muted)]">
                      {professional.user?.email}
                    </p>

                    {professional.phone && (
                      <p className="text-sm text-neutral-500">
                        {professional.phone}
                      </p>
                    )}

                    {professional.bio && (
                      <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                        {professional.bio}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-neutral-500">Categoría</p>

                    <p className="mt-1 font-medium">
                      {professional.category?.name || "Sin categoría"}
                    </p>

                    {(professional.city || professional.province) && (
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {professional.city} {professional.province}
                      </p>
                    )}

                    {professional.price ? (
                      <p className="mt-1 text-sm text-neutral-500">
                        ${professional.price}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-sm text-neutral-500">Plan</p>

                    <select
                      value={professional.user?.plan || "free"}
                      disabled={
                        !professional.user?._id ||
                        updatingId === professional.user?._id
                      }
                      onChange={(e) =>
                        professional.user?._id &&
                        updatePlan(
                          professional.user._id,
                          e.target.value as Plan
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-neutral-700 bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                    >
                      <option value="free">{planLabels.free}</option>
                      <option value="pro">{planLabels.pro}</option>
                      <option value="premium">{planLabels.premium}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-3 md:items-end">
                    <p
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        professional.isActive
                          ? "bg-green-950 text-green-400"
                          : "bg-yellow-950 text-yellow-400"
                      }`}
                    >
                      {professional.isActive ? "Activo" : "Pendiente"}
                    </p>

                    {professional.isActive ? (
                      <button
                        disabled={updatingId === professional._id}
                        onClick={() =>
                          updateProfessionalStatus(professional._id, false)
                        }
                        className="rounded-xl border border-red-900 px-4 py-2 text-sm text-red-400 hover:bg-red-950 disabled:opacity-60"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        disabled={updatingId === professional._id}
                        onClick={() =>
                          updateProfessionalStatus(professional._id, true)
                        }
                        className="rounded-xl border border-green-900 px-4 py-2 text-sm text-green-400 hover:bg-green-950 disabled:opacity-60"
                      >
                        Aprobar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}