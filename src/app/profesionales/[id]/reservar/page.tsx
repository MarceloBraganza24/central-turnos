"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter,useSearchParams } from "next/navigation";
import { toast } from "sonner";

type Service = {
  _id: string;
  name: string;
  durationMinutes: number;
  price: number;
  requiresDeposit?: boolean;
  depositAmount?: number;
};


type TenantConfig = {
  requiresDeposit: boolean;
  defaultDepositAmount: number;
  name: string;
};

export default function ReservarTurnoPage() {
  const [slots, setSlots] = useState<string[]>([]);
  const params = useParams();
  const router = useRouter();

  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get("tenant");

  const professionalId = params.id as string;

  const [date, setDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedServiceId, setSelectedServiceId] = useState("");

  const [services, setServices] = useState<Service[]>([]);
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    notes: "",
    depositAmount: "0",
  });

  useEffect(() => {
    async function loadServices() {
      const response = await fetch(
        `/api/public/professionals/${professionalId}/services`
      );

      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
    }

    loadServices();
  }, [professionalId]);

  useEffect(() => {
    async function loadTenantConfig() {
      if (!tenantSlug) return;

      const response = await fetch(`/api/public/tenants/${tenantSlug}`);
      const data = await response.json();

      if (!response.ok) return;

      setTenantConfig({
        requiresDeposit: data.tenant.requiresDeposit,
        defaultDepositAmount: data.tenant.defaultDepositAmount,
        name: data.tenant.name,
      });

      if (data.tenant.requiresDeposit) {
        setForm((current) => ({
          ...current,
          depositAmount: String(data.tenant.defaultDepositAmount || 0),
        }));
      }
    }

    loadTenantConfig();
  }, [tenantSlug]);

  useEffect(() => {
    async function loadSlots() {
      if (!date) return;

      setLoadingSlots(true);
      setSelectedSlot("");

      const response = await fetch(
        `/api/public/professionals/${professionalId}/available-slots?date=${date}&serviceId=${selectedServiceId}`
      );

      const data = await response.json();

      setSlots(Array.isArray(data) ? data : []);
      setLoadingSlots(false);
    }

    loadSlots();
  }, [date, professionalId,selectedServiceId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!date || !selectedSlot) {
      toast.error("Seleccioná fecha y horario");
      return;
    }

    if (services.length > 0 && !selectedServiceId) {
      toast.error("Seleccioná un servicio");
      return;
    }

    setSaving(true);

    const response = await fetch("/api/public/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        professionalId,
        appointmentDate: date,
        startTime: selectedSlot,
        ...form,
        depositAmount: Number(form.depositAmount) || 0,
        serviceId: selectedServiceId,
      }),
    });

    const data = await response.json();

    setSaving(false);

    if (!response.ok) {
      toast.error(data.message || "Error al reservar turno");
      return;
    }

    router.push(`/mi-reserva/${data.publicToken}`);
  }

  const today = new Date().toISOString().split("T")[0];

  console.log("SLOTS", slots);

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 pb-28 text-[var(--foreground)]">
      <section className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Reservar turno</h1>

        <div>
          <label className="mb-2 block text-sm text-black">
            Servicio
          </label>

          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="w-full rounded-xl border border-brand bg-[var(--background)] px-4 py-3"
          >
            <option value="">Seleccionar servicio</option>

            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.name} · {service.durationMinutes} min · ${service.price}
              </option>
            ))}
          </select>
        </div>

        <p className="mt-2 text-black">
          Elegí fecha, horario y completá tus datos para confirmar la reserva.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]"
        >
          <div className="space-y-6 premium-card premium-card-hover premium-gradient rounded-3xl p-6">
            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Fecha
              </label>
              <input
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Horarios disponibles
              </label>

              {!date ? (
                <p className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
                  Primero seleccioná una fecha.
                </p>
              ) : loadingSlots ? (
                <p className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
                  Buscando horarios...
                </p>
              ) : slots.length === 0 ? (
                <p className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
                  No hay horarios disponibles para esta fecha.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-xl border px-4 py-3 text-sm ${
                        selectedSlot === slot
                          ? "border-brand bg-brand text-[var(--foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  Nombre completo
                </label>
                <input
                  value={form.fullName}
                  autoComplete="name"
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  WhatsApp
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                  placeholder="Ej: 5492926..."
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Email opcional
              </label>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Motivo / comentario opcional
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="min-h-28 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                placeholder="Ej: primera consulta, control, dolor, objetivo, etc."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Seña opcional
              </label>
              <input
                type="number"
                value={form.depositAmount}
                disabled={tenantConfig?.requiresDeposit}
                onChange={(e) =>
                  setForm({ ...form, depositAmount: e.target.value })
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 disabled:opacity-60"
                placeholder="Ej: 3000"
              />
              {tenantConfig?.requiresDeposit ? (
                <p className="mt-2 text-xs text-yellow-400">
                  Este profesional requiere una seña de ${tenantConfig.defaultDepositAmount} para reservar.
                </p>
              ) : (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Si cargás una seña, el turno queda pendiente hasta que se pague.
                </p>
              )}
            </div>
          </div>

          <aside className="h-fit premium-card premium-card-hover premium-gradient rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white">Resumen</h2>

            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-2xl bg-[var(--background)] p-4">
                <p className="text-[var(--muted)]">Fecha</p>
                <p className="mt-1 font-medium">{date || "Sin seleccionar"}</p>
              </div>

              <div className="rounded-2xl bg-[var(--background)] p-4">
                <p className="text-[var(--muted)]">Horario</p>
                <p className="mt-1 font-medium">
                  {selectedSlot || "Sin seleccionar"}
                </p>
              </div>

              <div className="rounded-2xl bg-[var(--background)] p-4">
                <p className="text-[var(--muted)]">Cliente</p>
                <p className="mt-1 font-medium">
                  {form.fullName || "Sin completar"}
                </p>
              </div>

              <div className="rounded-2xl bg-[var(--background)] p-4">
                <p className="text-[var(--muted)]">Seña</p>
                <p className="mt-1 font-medium">
                  ${Number(form.depositAmount) || 0}
                </p>
              </div>
            </div>
          </aside>
          <button
            type="submit"
            disabled={saving}
            className="mt-6 hidden w-full rounded-xl bg-brand px-5 py-3 font-medium text-white hover:bg-brand-hover disabled:opacity-60 lg:block"
          >
            {saving ? "Reservando..." : "Confirmar reserva"}
          </button>
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--background)] p-4 lg:hidden">
            <button
              type="submit"
              disabled={saving}
              className="touch-button w-full bg-brand text-[var(--foreground)] hover:bg-brand-hover disabled:opacity-60"
            >
              {saving ? "Reservando..." : "Confirmar reserva"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}