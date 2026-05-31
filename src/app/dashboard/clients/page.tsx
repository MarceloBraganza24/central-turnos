"use client";

import { useEffect, useState } from "react";

type AppointmentHistory = {
  _id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
};

type Client = {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  totalAppointments: number;
  lastAppointmentDate: string;
  lastAppointmentTime: string;
  appointments: AppointmentHistory[];
};

const statusLabels = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Completado",
};

export default function DashboardClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [openClientId, setOpenClientId] = useState<string | null>(null);

  async function loadClients() {
    const response = await fetch("/api/clients");
    const data = await response.json();

    setClients(data);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      try {
        await loadClients();
      } catch (error) {
        console.error(error);
      }
    }

    init();
  }, []);

  if (loading) {
    return (
      <main className="max-w-6xl">
        Cargando clientes...
      </main>
    );
  }

  return (
    <main className="max-w-6xl">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Mis clientes</h1>

        <p className="mt-2 text-[var(--muted)]">
          Acá vas a ver las personas que reservaron turnos con vos y su
          historial.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          {clients.length === 0 ? (
            <p className="p-6 text-[var(--muted)]">
              Todavía no tenés clientes registrados.
            </p>
          ) : (
            <div className="divide-y divide-neutral-800">
              {clients.map((client) => {
                const isOpen = openClientId === client._id;

                return (
                  <div key={client._id} className="p-5">
                    <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr_0.7fr]">
                      <div>
                        <p className="text-sm text-neutral-500">Cliente</p>
                        <p className="mt-1 font-medium">{client.fullName}</p>
                        <p className="text-sm text-[var(--muted)]">
                          {client.phone}
                        </p>
                        {client.email && (
                          <p className="text-sm text-neutral-500">
                            {client.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-neutral-500">
                          Total de turnos
                        </p>
                        <p className="mt-1 font-medium">
                          {client.totalAppointments}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-neutral-500">
                          Último turno
                        </p>
                        <p className="mt-1 font-medium">
                          {client.lastAppointmentDate}
                        </p>
                        <p className="text-sm text-[var(--muted)]">
                          {client.lastAppointmentTime}
                        </p>
                      </div>

                      <div className="flex items-start md:justify-end">
                        <button
                          onClick={() =>
                            setOpenClientId(isOpen ? null : client._id)
                          }
                          className="rounded-xl border border-neutral-700 px-4 py-2 text-sm transition hover:bg-neutral-800"
                        >
                          {isOpen ? "Ocultar" : "Ver historial"}
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--background)]">
                        <div className="border-b border-[var(--border)] p-4">
                          <h2 className="font-semibold">
                            Historial de turnos
                          </h2>
                        </div>

                        <div className="divide-y divide-neutral-800">
                          {client.appointments.map((appointment) => (
                            <div
                              key={appointment._id}
                              className="grid gap-3 p-4 md:grid-cols-[1fr_1fr_1fr]"
                            >
                              <div>
                                <p className="text-sm text-neutral-500">
                                  Fecha
                                </p>
                                <p className="font-medium">
                                  {appointment.appointmentDate}
                                </p>
                                <p className="text-sm text-[var(--muted)]">
                                  {appointment.startTime} a{" "}
                                  {appointment.endTime}
                                </p>
                              </div>

                              <div>
                                <p className="text-sm text-neutral-500">
                                  Estado
                                </p>
                                <p className="font-medium">
                                  {statusLabels[appointment.status]}
                                </p>
                              </div>

                              <div>
                                <p className="text-sm text-neutral-500">
                                  Notas
                                </p>
                                <p className="text-sm text-[var(--muted)]">
                                  {appointment.notes || "Sin notas"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}