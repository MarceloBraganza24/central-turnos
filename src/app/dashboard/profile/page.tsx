"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import ImageUploader from "@/components/ui/ImageUploader";

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
};

type ProfessionalProfile = {
  _id?: string;
  displayName: string;
  category?: string;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  imageUrl?: string;
  province?: string;
  price?: number;
  appointmentDurationMinutes?: number;
};

export default function DashboardProfilePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    displayName: "",
    category: "",
    bio: "",
    phone: "",
    imageUrl: "",
    address: "",
    city: "",
    province: "",
    price: "",
    appointmentDurationMinutes: "30",
  });

  useEffect(() => {
    async function loadData() {
      const [categoriesRes, profileRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/professional-profile"),
      ]);

      const categoriesData = await categoriesRes.json();
      const profileData: ProfessionalProfile | null = await profileRes.json();

      setCategories(categoriesData);

      if (profileData) {
        setForm({
          displayName: profileData.displayName || "",
          category: profileData.category || "",
          bio: profileData.bio || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          imageUrl: profileData.imageUrl || "",
          city: profileData.city || "",
          province: profileData.province || "",
          price: String(profileData.price || ""),
          appointmentDurationMinutes: String(
            profileData.appointmentDurationMinutes || 30
          ),
        });
      }

      setLoading(false);
    }

    loadData();
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    const response = await fetch("/api/professional-profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    setSaving(false);

    if (!response.ok) {
      toast.error(data.message || "Error al guardar el perfil");
      return;
    }

    toast.success("Perfil actualizado correctamente");
  }

  if (loading) {
    return (
      <main className="max-w-6xl">
        Cargando perfil...
      </main>
    );
  }

  return (
    <main className="max-w-6xl">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Mi perfil profesional</h1>

        <p className="mt-2 text-[var(--muted)]">
          Estos datos van a aparecer en tu perfil público para que los clientes
          puedan reservar turnos.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
        >
          <div>
            <label className="mb-2 block text-sm text-black">
              Foto profesional
            </label>

            <ImageUploader
              value={form.imageUrl}
              folder="central-turnos/professionals"
              label="Subir foto"
              onChange={(url) =>
                setForm({
                  ...form,
                  imageUrl: url,
                })
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-black">
              Nombre visible
            </label>
            <input
              name="displayName"
              autoComplete="name"
              value={form.displayName}
              onChange={handleChange}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
              placeholder="Ej: Lic. Juan Pérez"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-black">
              Categoría profesional
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
            >
              <option value="">Seleccionar categoría</option>

              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-black">
              Descripción / Bio
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="min-h-28 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
              placeholder="Contá quién sos, qué hacés y cómo trabajás."
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-black">
                Teléfono
              </label>
              <input
                inputMode="tel"
                autoComplete="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                placeholder="Ej: 5492926453622"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-black">
                Precio de consulta
              </label>
              <input
                name="price"
                inputMode="numeric"
                type="number"
                value={form.price}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                placeholder="Ej: 12000"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-black">
                Ciudad
              </label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                placeholder="Ej: Coronel Suárez"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-black">
                Provincia
              </label>
              <input
                name="province"
                value={form.province}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                placeholder="Ej: Buenos Aires"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-black">
              Dirección
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
              placeholder="Ej: Av. Alsina 123"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-black">
              Duración del turno en minutos
            </label>
            <input
              name="appointmentDurationMinutes"
              type="number"
              value={form.appointmentDurationMinutes}
              onChange={handleChange}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
              placeholder="30"
            />
          </div>

          <button
            disabled={saving}
            className="w-full rounded-xl bg-brand py-3 font-medium text-white hover:bg-brand-hover disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar perfil"}
          </button>
        </form>
      </section>
    </main>
  );
}