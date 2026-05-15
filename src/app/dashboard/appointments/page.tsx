"use client";

import StatusBadge from "@/components/ui/StatusBadge";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Client = {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
};

type Appointment = {
  _id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "unpaid" | "pending" | "paid" | "failed";
  notes?: string;
  client: Client;
};

export default function DashboardAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAppointments() {
    const response = await fetch("/api/appointments");
    const data = await response.json();

    setAppointments(data);
    setLoading(false);
  }

  useEffect(() => {
    void (async () => {
      try {
        await loadAppointments();
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  async function updateStatus(appointmentId: string, status: string) {
    const response = await fetch("/api/appointments", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appointmentId,
        status,
      }),
    });

    if (!response.ok) {
      toast.error("Error al actualizar el turno");
      return;
    }

    await loadAppointments();
  }

  if (loading) {
    return (
      <main className="max-w-6xl">
        Cargando turnos...
      </main>
    );
  }

  return (
    <main className="max-w-6xl">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Mis turnos</h1>

        <p className="mt-2 text-neutral-400">
          Acá vas a ver todos los turnos reservados por tus clientes.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
          {appointments.length === 0 ? (
            <p className="p-6 text-neutral-400">
              Todavía no tenés turnos reservados.
            </p>
          ) : (
            <div className="divide-y divide-neutral-800">
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="grid gap-4 p-5 md:grid-cols-[1.2fr_1.2fr_1fr_1fr]"
                >
                  <div>
                    <p className="text-sm text-neutral-500">Fecha y hora</p>
                    <p className="mt-1 font-medium">
                      {appointment.appointmentDate}
                    </p>
                    <p className="text-sm text-neutral-400">
                      {appointment.startTime} a {appointment.endTime}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-neutral-500">Cliente</p>
                    <p className="mt-1 font-medium">
                      {appointment.client?.fullName}
                    </p>
                    <p className="text-sm text-neutral-400">
                      {appointment.client?.phone}
                    </p>
                    {appointment.client?.email && (
                      <p className="text-sm text-neutral-500">
                        {appointment.client.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-neutral-500">Estado</p>
                    <StatusBadge
                      type="appointment"
                      status={appointment.status}
                    />
                    <StatusBadge
                      type="payment"
                      status={appointment.paymentStatus || "unpaid"}
                    />
                    {appointment.notes && (
                      <p className="mt-2 text-sm text-neutral-400">
                        {appointment.notes}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-neutral-500">Acciones</p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          updateStatus(appointment._id, "confirmed")
                        }
                        className="rounded-lg border border-green-900 px-3 py-2 text-xs text-green-400 hover:bg-green-950"
                      >
                        Confirmar
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(appointment._id, "completed")
                        }
                        className="rounded-lg border border-blue-900 px-3 py-2 text-xs text-blue-400 hover:bg-blue-950"
                      >
                        Completar
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(appointment._id, "cancelled")
                        }
                        className="rounded-lg border border-red-900 px-3 py-2 text-xs text-red-400 hover:bg-red-950"
                      >
                        Cancelar
                      </button>
                    </div>
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