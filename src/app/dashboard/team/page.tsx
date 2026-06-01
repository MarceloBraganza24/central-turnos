"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type TenantRole =
  | "owner"
  | "manager"
  | "professional"
  | "receptionist"
  | "staff"
  | "collaborator";

type Member = {
  _id: string;
  role: TenantRole;
  isActive: boolean;
  user: {
    _id: string;
    fullName: string;
    email: string;
  };
};

const roleLabels: Record<TenantRole, string> = {
  owner: "Dueño",
  manager: "Manager",
  professional: "Profesional",
  receptionist: "Recepcionista",
  staff: "Staff",
  collaborator: "Colaborador",
};

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "receptionist" as TenantRole,
  });

  async function loadMembers() {
    const response = await fetch("/api/team");
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "No tenés permisos para ver equipo");
      setLoading(false);
      return;
    }

    setMembers(data);
    setLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMembers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);

    const response = await fetch("/api/team", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    setSaving(false);

    if (!response.ok) {
      toast.error(data.message || "Error al agregar miembro");
      return;
    }

    toast.success("Miembro agregado");
    setForm({
      fullName: "",
      email: "",
      password: "",
      role: "receptionist",
    });

    await loadMembers();
  }

  async function updateMember(memberId: string, body: Record<string, unknown>) {
    const response = await fetch("/api/team", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memberId,
        ...body,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Error al actualizar miembro");
      return;
    }

    toast.success("Miembro actualizado");
    await loadMembers();
  }

  if (loading) {
    return <section className="text-[var(--foreground)]">Cargando equipo...</section>;
  }

  return (
    <section className="max-w-7xl text-[var(--foreground)]">
      <h1 className="text-3xl font-bold">Equipo</h1>

      <p className="mt-2 text-[var(--muted)]">
        Agregá recepcionistas, staff o managers para ayudarte a gestionar el espacio.
      </p>

      <form
        onSubmit={addMember}
        className="mt-8 grid gap-4 premium-card premium-card-hover premium-gradient rounded-3xl p-6 md:grid-cols-5"
      >
        <input
          value={form.fullName}
          autoComplete="name"
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
          placeholder="Nombre"
        />

        <input
          type="email"
          value={form.email}
          autoComplete="email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
          placeholder="Email"
        />

        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
          placeholder="Contraseña inicial"
        />

        <select
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value as TenantRole })
          }
          className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
        >
          {Object.entries(roleLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <button
          disabled={saving}
          className="rounded-xl bg-brand hover:bg-brand-hover px-5 py-3 font-medium text-white disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Agregar"}
        </button>
      </form>

      <div className="mt-8 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)]">
        {members.length === 0 ? (
          <p className="p-6 text-[var(--muted)]">Todavía no hay miembros.</p>
        ) : (
          <div className="divide-y divide-neutral-800">
            {members.map((member) => (
              <div
                key={member._id}
                className="grid gap-4 p-5 md:grid-cols-[1.4fr_1fr_1fr] premium-gradient"
              >
                <div>
                  <p className="font-medium text-white">{member.user.fullName}</p>
                  <p className="text-sm text-white">
                    {member.user.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-white">Rol</p>
                  <select
                    value={member.role}
                    onChange={(e) =>
                      updateMember(member._id, {
                        role: e.target.value,
                      })
                    }
                    className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  >
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={() =>
                      updateMember(member._id, {
                        isActive: !member.isActive,
                      })
                    }
                    className={`rounded-xl border px-4 py-2 text-sm ${
                      member.isActive
                        ? "border-red-900 text-red-400 hover:bg-red-950"
                        : "border-green-900 text-green-400 hover:bg-green-950"
                    }`}
                  >
                    {member.isActive ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}