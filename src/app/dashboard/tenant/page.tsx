"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import FadeIn from "@/components/animations/FadeIn";
import Image from "next/image";
import ImageUploader from "@/components/ui/ImageUploader";

type TenantForm = {
  name: string;
  slug: string;
  subdomain: string;
  customDomain: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  welcomeMessage: string;
  cancellationPolicy: string;
  requiresDeposit: boolean;
  defaultDepositAmount: string;

  city: string;
  province: string;
  country: string;
  neighborhood: string;
  offersOnline: boolean;
  languages: string[];
  insuranceProviders: string[];
};

export default function TenantSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [insuranceProvidersInput, setInsuranceProvidersInput] = useState("");


  const [form, setForm] = useState<TenantForm>({
    name: "",
    slug: "",
    subdomain: "",
    customDomain: "",
    logoUrl: "",
    primaryColor: "#ffffff",
    accentColor: "#a3a3a3",
    welcomeMessage: "",
    cancellationPolicy: "",
    requiresDeposit: false,
    defaultDepositAmount: "0",

    city: "",
    province: "",
    country: "Argentina",
    neighborhood: "",
    offersOnline: false,
    languages: ["Español"],
    insuranceProviders: [],
  });

  useEffect(() => {
    async function loadTenant() {
      const response = await fetch("/api/tenant/settings");
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Error al cargar configuración");
        setLoading(false);
        return;
      }

      setForm({
        name: data.name || "",
        slug: data.slug || "",
        subdomain: data.subdomain || "",
        customDomain: data.customDomain || "",
        logoUrl: data.logoUrl || "",
        primaryColor: data.primaryColor || "#ffffff",
        accentColor: data.accentColor || "#a3a3a3",
        welcomeMessage: data.welcomeMessage || "",
        cancellationPolicy: data.cancellationPolicy || "",
        requiresDeposit: data.requiresDeposit || false,
        defaultDepositAmount: String(data.defaultDepositAmount || 0),
        city: data.city || "",
        province: data.province || "",
        country: data.country || "Argentina",
        neighborhood: data.neighborhood || "",
        offersOnline: data.offersOnline || false,
        languages: data.languages || ["Español"],
        insuranceProviders: data.insuranceProviders || [],
      });
      
      setInsuranceProvidersInput(
        Array.isArray(data.insuranceProviders)
          ? data.insuranceProviders.join(", ")
          : ""
      );
        

      setLoading(false);
    }

    loadTenant();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    const response = await fetch("/api/tenant/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        insuranceProviders: insuranceProvidersInput
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    });

    const data = await response.json();

    setSaving(false);

    if (!response.ok) {
      toast.error(data.message || "Error al guardar configuración");
      return;
    }

    toast.success("Configuración guardada");
  }

  if (loading) {
    return <section className="text-[var(--foreground)]">Cargando configuración...</section>;
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/p/${form.slug}`;

  return (
    <section className="max-w-5xl text-[var(--foreground)]">
      <h1 className="text-3xl font-bold">Configuración del espacio</h1>

      <p className="mt-2 text-[var(--muted)]">
        Personalizá tu espacio público, branding, link y políticas de reserva.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="space-y-6">
          <FadeIn delay={0.1}>
            <div className="premium-card premium-gradient rounded-3xl p-6">
              <h2 className="text-xl font-semibold text-white">Identidad pública</h2>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-white">
                    Nombre del espacio
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                    placeholder="Ej: Nutrición Juan Pérez"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white">
                    Link público
                  </label>
                  <input
                    value={form.slug}
                    onChange={(e) =>
                      setForm({ ...form, slug: e.target.value })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                    placeholder="dr-juan-perez"
                  />
                  <p className="mt-2 text-xs text-white">
                    Tu link será: /p/{form.slug}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white">
                    Subdominio
                  </label>
                  <input
                    value={form.subdomain}
                    onChange={(e) =>
                      setForm({ ...form, subdomain: e.target.value })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                    placeholder="drjuan"
                  />
                  <p className="mt-2 text-xs text-white">
                    Futuro: {form.subdomain || "nombre"}.tudominio.com
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white">
                    Dominio propio opcional
                  </label>
                  <input
                    value={form.customDomain}
                    onChange={(e) =>
                      setForm({ ...form, customDomain: e.target.value })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                    placeholder="turnos.drjuanperez.com"
                  />
                </div>
              </div>
            </div>
          </FadeIn>
          

          <FadeIn delay={0.1}>
            <div className="premium-card premium-gradient  rounded-3xl p-6">
              <h2 className="text-xl font-semibold text-white">Branding</h2>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-sm text-white">
                    Logo / imagen del espacio
                  </label>

                  <div className="mt-2">
                    <ImageUploader
                      value={form.logoUrl}
                      folder="central-turnos/tenants"
                      label="Subir logo"
                      onChange={(url) =>
                        setForm({
                          ...form,
                          logoUrl: url,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-white">
                      Color principal
                    </label>
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={(e) =>
                        setForm({ ...form, primaryColor: e.target.value })
                      }
                      className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-2"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-white">
                      Color secundario
                    </label>
                    <input
                      type="color"
                      value={form.accentColor}
                      onChange={(e) =>
                        setForm({ ...form, accentColor: e.target.value })
                      }
                      className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.1}>
            <div className="premium-card premium-gradient  rounded-3xl p-6">
              <h2 className="text-xl font-semibold text-white">Reglas de reserva</h2>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-white">
                    Mensaje de bienvenida
                  </label>
                  <textarea
                    value={form.welcomeMessage}
                    placeholder="Ej: Hola 👋 Gracias por elegir nuestro consultorio."
                    onChange={(e) =>
                      setForm({ ...form, welcomeMessage: e.target.value })
                    }
                    className="min-h-24 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white">
                    Política de cancelación
                  </label>
                  <textarea
                    value={form.cancellationPolicy}
                    placeholder="Ej: Las cancelaciones deben realizarse con al menos 24 horas de anticipación."
                    onChange={(e) =>
                      setForm({ ...form, cancellationPolicy: e.target.value })
                    }
                    className="min-h-24 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                  />
                </div>

                <label className="flex items-center gap-3 text-sm text-white">
                  <input
                    type="checkbox"
                    checked={form.requiresDeposit}
                    onChange={(e) =>
                      setForm({ ...form, requiresDeposit: e.target.checked })
                    }
                  />
                  Requerir seña para reservar
                </label>

                <div>
                  <label className="mb-2 block text-sm text-white">
                    Monto de seña por defecto
                  </label>
                  <input
                    type="number"
                    value={form.defaultDepositAmount}
                    onChange={(e) =>
                      setForm({ ...form, defaultDepositAmount: e.target.value })
                    }
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                  />
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.1}>
          <div className="premium-card premium-gradient rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white">
              Ubicación y filtros
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Provincia
                </label>

                <input
                  value={form.province}
                  onChange={(e) =>
                    setForm({ ...form, province: e.target.value })
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                  placeholder="Ej: Buenos Aires"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Ciudad
                </label>

                <input
                  value={form.city}
                  onChange={(e) =>
                    setForm({ ...form, city: e.target.value })
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                  placeholder="Ej: Coronel Suárez"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Barrio / Zona
                </label>

                <input
                  value={form.neighborhood}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      neighborhood: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                  placeholder="Opcional"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  País
                </label>

                <input
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                  placeholder="Argentina"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-white">
                Idiomas de atención
              </label>

              <input
                value={form.languages.join(", ")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    languages: e.target.value
                      .split(",")
                      .map((item) => item.trim()),
                  })
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                placeholder="Español, Inglés, Portugués"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-white">
                Obras sociales aceptadas
              </label>

              <input
                value={insuranceProvidersInput}
                onChange={(e) =>
                  setInsuranceProvidersInput(e.target.value)
                }
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                placeholder="OSDE 210, Swiss Medical, IOMA, PAMI"
              />
            </div>

            <label className="mt-5 flex items-center gap-3 text-sm text-white">
              <input
                type="checkbox"
                checked={form.offersOnline}
                onChange={(e) =>
                  setForm({
                    ...form,
                    offersOnline: e.target.checked,
                  })
                }
              />
              También atiendo online
            </label>
          </div>
        </FadeIn>          

        <aside className="h-fit space-y-4">
          <div className="premium-card premium-gradient rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white">Vista previa</h2>

            <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
              {form.logoUrl ? (
                <Image
                  src={form.logoUrl}
                  alt={form.name || "Logo"}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-2xl object-cover"
                />
              ) : (
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-black"
                  style={{ backgroundColor: form.primaryColor }}
                >
                  {form.name.charAt(0) || "T"}
                </div>
              )}

              <h3 className="mt-4 text-xl font-bold">
                {form.name || "Nombre del espacio"}
              </h3>

              <p className="mt-2 text-sm text-[var(--muted)]">
                {form.welcomeMessage || "Mensaje de bienvenida"}
              </p>

              <div className="mt-5 h-2 rounded-full bg-[var(--card-soft)]">
                <div
                  className="h-2 w-2/3 rounded-full"
                  style={{ backgroundColor: form.primaryColor }}
                />
              </div>
            </div>

            <p className="mt-4 break-all text-xs text-white">
              {publicUrl}
            </p>
          </div>

          <button
            disabled={saving}
            className="w-full rounded-xl bg-brand py-3 font-medium text-white hover:bg-brand-hover disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar configuración"}
          </button>
        </aside>
      </form>
    </section>
  );
}