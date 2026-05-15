"use client";

import FadeIn from "@/components/animations/FadeIn";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

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

  depositAmount?: number;

  client: {
    fullName: string;
    phone: string;
  };

  professional: {
    displayName: string;

    category?: {
      name: string;
    };
  };
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<
    Appointment[]
  >([]);

  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] =
    useState("");

  const loadAppointments = useCallback(async () => {
    try {
      const params = new URLSearchParams();

      if (status) {
        params.set("status", status);
      }

      if (paymentStatus) {
        params.set(
          "paymentStatus",
          paymentStatus
        );
      }

      const response = await fetch(
        `/api/admin/appointments?${params.toString()}`
      );

      const data = await response.json();

      setAppointments(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(error);

      setAppointments([]);
    }
  }, [status, paymentStatus]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAppointments();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadAppointments]);

  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-white">
      <section className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">
          Turnos del sistema
        </h1>

        <p className="mt-2 text-neutral-400">
          Vista general de todas las reservas
          generadas en la plataforma.
        </p>

        <div className="premium-card mt-8 rounded-3xl p-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
            >
              <option value="">
                Todos los estados
              </option>

              <option value="pending">
                Pendientes
              </option>

              <option value="confirmed">
                Confirmados
              </option>

              <option value="cancelled">
                Cancelados
              </option>

              <option value="completed">
                Completados
              </option>
            </select>

            <select
              value={paymentStatus}
              onChange={(e) =>
                setPaymentStatus(e.target.value)
              }
              className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
            >
              <option value="">
                Todos los pagos
              </option>

              <option value="unpaid">
                Sin pago
              </option>

              <option value="pending">
                Pago pendiente
              </option>

              <option value="paid">
                Pagado
              </option>

              <option value="failed">
                Pago fallido
              </option>
            </select>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {appointments.length === 0 ? (
            <div className="premium-card rounded-3xl p-6">
              <p className="text-neutral-400">
                No hay turnos para mostrar.
              </p>
            </div>
          ) : (
            appointments.map(
              (appointment, index) => (
                <FadeIn
                  key={appointment._id}
                  delay={index * 0.04}
                >
                  <div className="premium-card premium-card-hover premium-gradient rounded-3xl p-6">
                    <div className="grid gap-6 md:grid-cols-[1fr_1fr_1fr_1fr]">
                      <div>
                        <p className="text-sm text-neutral-500">
                          Fecha
                        </p>

                        <p className="mt-1 font-medium">
                          {
                            appointment.appointmentDate
                          }
                        </p>

                        <p className="text-sm text-neutral-400">
                          {
                            appointment.startTime
                          }{" "}
                          a{" "}
                          {appointment.endTime}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-neutral-500">
                          Profesional
                        </p>

                        <p className="mt-1 font-medium">
                          {
                            appointment
                              .professional
                              ?.displayName
                          }
                        </p>

                        <p className="text-sm text-neutral-400">
                          {
                            appointment
                              .professional
                              ?.category?.name
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-neutral-500">
                          Cliente
                        </p>

                        <p className="mt-1 font-medium">
                          {
                            appointment.client
                              ?.fullName
                          }
                        </p>

                        <p className="text-sm text-neutral-400">
                          {
                            appointment.client
                              ?.phone
                          }
                        </p>
                      </div>

                      <div className="space-y-2">
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

                        {(appointment.depositAmount ??
                          0) > 0 && (
                          <p className="text-sm text-neutral-400">
                            Seña: $
                            {
                              appointment.depositAmount
                            }
                          </p>
                        )}

                        <div className="space-y-1">
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
                    </div>
                  </div>
                </FadeIn>
              )
            )
          )}
        </div>
      </section>
    </main>
  );
}