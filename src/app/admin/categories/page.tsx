"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );

  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  async function loadCategories() {
    const response = await fetch("/api/admin/categories");
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Error al cargar categorías");
      setLoading(false);
      return;
    }

    setCategories(data);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      try {
        await loadCategories();
      } catch (error) {
        console.error(error);
      }
    }

    init();
  }, []);

  function resetForm() {
    setEditingCategoryId(null);
    setForm({
      name: "",
      description: "",
      isActive: true,
    });
  }

  function startEditing(category: Category) {
    setEditingCategoryId(category._id);
    setForm({
      name: category.name,
      description: category.description || "",
      isActive: category.isActive,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    const response = await fetch("/api/admin/categories", {
      method: editingCategoryId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        categoryId: editingCategoryId,
        ...form,
      }),
    });

    const data = await response.json();

    setSaving(false);

    if (!response.ok) {
      toast.error(data.message || "Error al guardar categoría");
      return;
    }

    resetForm();
    await loadCategories();
  }

  async function toggleCategory(category: Category) {
    const response = await fetch("/api/admin/categories", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        categoryId: category._id,
        name: category.name,
        description: category.description || "",
        isActive: !category.isActive,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Error al actualizar categoría");
      return;
    }

    await loadCategories();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] p-6 text-[var(--foreground)]">
        Cargando categorías...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] p-6 text-[var(--foreground)]">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Categorías</h1>

        <p className="mt-2 text-[var(--muted)]">
          Creá y administrá las categorías profesionales visibles en el sistema.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
        >
          <h2 className="text-xl font-semibold">
            {editingCategoryId ? "Editar categoría" : "Nueva categoría"}
          </h2>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">
              Nombre
            </label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="w-full rounded-xl border border-neutral-700 bg-[var(--background)] px-4 py-3"
              placeholder="Ej: Odontología"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              className="min-h-24 w-full rounded-xl border border-neutral-700 bg-[var(--background)] px-4 py-3"
              placeholder="Breve descripción de la categoría"
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm({
                  ...form,
                  isActive: e.target.checked,
                })
              }
            />
            Categoría activa
          </label>

          <div className="flex gap-3">
            <button
              disabled={saving}
              className="rounded-xl bg-white px-6 py-3 font-medium text-black disabled:opacity-60"
            >
              {saving
                ? "Guardando..."
                : editingCategoryId
                  ? "Guardar cambios"
                  : "Crear categoría"}
            </button>

            {editingCategoryId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-neutral-700 px-6 py-3 font-medium text-[var(--foreground)] hover:bg-neutral-800"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          {categories.length === 0 ? (
            <p className="p-6 text-[var(--muted)]">
              Todavía no hay categorías creadas.
            </p>
          ) : (
            <div className="divide-y divide-neutral-800">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="grid gap-4 p-5 md:grid-cols-[1.5fr_1fr_0.8fr]"
                >
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      /{category.slug}
                    </p>
                    {category.description && (
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {category.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-neutral-500">Estado</p>
                    <p
                      className={`mt-1 font-medium ${
                        category.isActive
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {category.isActive ? "Activa" : "Inactiva"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <button
                      onClick={() => startEditing(category)}
                      className="rounded-xl border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => toggleCategory(category)}
                      className="rounded-xl border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
                    >
                      {category.isActive ? "Desactivar" : "Activar"}
                    </button>
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