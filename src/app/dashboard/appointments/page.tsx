"use client";

import FadeIn from "@/components/animations/FadeIn";
import StatusBadge from "@/components/ui/StatusBadge";
import { useCallback, useEffect, useState } from "react";
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

  status:
    | "pending"
    | "confirmed"
    | "cancelled"
    | "completed";

  paymentStatus:
    | "unpaid"
    | "pending"
    | "paid"
    | "failed";

  whatsappClientStatus?: "pending" | "sent" | "failed";
  whatsappProfessionalStatus?: "pending" | "sent" | "failed";

  notes?: string;

  client: Client;
};

export default function DashboardAppointmentsPage() {
  const [appointments, setAppointments] = useState<
    Appointment[]
  >([]);

  const [loading, setLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    try {
      const response = await fetch("/api/appointments");

      const data = await response.json();

      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      toast.error("Error al cargar turnos");

      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAppointments();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadAppointments]);

  async function updateStatus(
    appointmentId: string,
    status: string
  ) {
    try {
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

      toast.success("Turno actualizado");

      await loadAppointments();
    } catch (error) {
      console.error(error);

      toast.error("Ocurrió un error");
    }
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
        <h1 className="text-3xl font-bold">
          Mis turnos
        </h1>

        <p className="mt-2 text-[var(--muted)]">
          Acá vas a ver todos los turnos reservados
          por tus clientes.
        </p>

        <div className="mt-8 space-y-4">
          {appointments.length === 0 ? (
            <div className="premium-card rounded-3xl p-6">
              <p className="text-[var(--muted)]">
                Todavía no tenés turnos reservados.
              </p>
            </div>
          ) : (
            appointments.map((appointment, index) => (
              <FadeIn
                key={appointment._id}
                delay={index * 0.04}
              >
                <div className="premium-card premium-card-hover premium-gradient rounded-3xl p-6">
                  <div className="grid gap-6 md:grid-cols-[1.2fr_1.2fr_1fr_1fr]">
                    <div>
                      <p className="text-sm text-neutral-500">
                        Fecha y hora
                      </p>

                      <p className="mt-1 font-medium">
                        {appointment.appointmentDate}
                      </p>

                      <p className="text-sm text-[var(--muted)]">
                        {appointment.startTime} a{" "}
                        {appointment.endTime}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-neutral-500">
                        Cliente
                      </p>

                      <p className="mt-1 font-medium">
                        {
                          appointment.client?.fullName
                        }
                      </p>

                      <p className="text-sm text-[var(--muted)]">
                        {appointment.client?.phone}
                      </p>

                      {appointment.client?.email && (
                        <p className="text-sm text-neutral-500">
                          {
                            appointment.client.email
                          }
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-neutral-500">
                        Estado
                      </p>

                      <div className="mt-2 flex flex-col gap-2">
                        <StatusBadge
                          type="appointment"
                          status={
                            appointment.status
                          }
                        />

                        <StatusBadge
                          type="payment"
                          status={
                            appointment.paymentStatus ||
                            "unpaid"
                          }
                        />
                      </div>

                      {appointment.notes && (
                        <p className="mt-3 text-sm text-[var(--muted)]">
                          {appointment.notes}
                        </p>
                      )}

                      <div className="mt-3 space-y-1">
                        {appointment.whatsappClientStatus ===
                          "failed" && (
                          <p className="text-xs text-red-400">
                            Falló WhatsApp al
                            cliente
                          </p>
                        )}

                        {appointment.whatsappProfessionalStatus ===
                          "failed" && (
                          <p className="text-xs text-red-400">
                            Falló WhatsApp al
                            profesional
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-neutral-500">
                        Acciones
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            updateStatus(
                              appointment._id,
                              "confirmed"
                            )
                          }
                          className="touch-button rounded-xl border border-green-900 bg-green-950/20 px-4 py-2 text-xs text-green-400 hover:bg-green-950"
                        >
                          Confirmar
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(
                              appointment._id,
                              "completed"
                            )
                          }
                          className="touch-button rounded-xl border border-blue-900 bg-blue-950/20 px-4 py-2 text-xs text-blue-400 hover:bg-blue-950"
                        >
                          Completar
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(
                              appointment._id,
                              "cancelled"
                            )
                          }
                          className="touch-button rounded-xl border border-red-900 bg-red-950/20 px-4 py-2 text-xs text-red-400 hover:bg-red-950"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))
          )}
        </div>
      </section>
    </main>
  );
}