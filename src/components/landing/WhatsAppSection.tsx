import Image from "next/image";

export default function WhatsAppSection() {
  return (
    <section className="border-t border-neutral-900 px-6 py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div>
          <p className="text-sm text-brand">
            Automatización por WhatsApp
          </p>

          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            Confirmaciones y recordatorios automáticos.
          </h2>

          <p className="mt-5 max-w-xl text-lg text-[var(--muted)]">
            Central Turnos envía mensajes automáticos
            para confirmar reservas, recordar turnos y
            ayudar a profesionales a organizarse mejor.
          </p>

          <div className="mt-10 space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <h3 className="font-semibold">
                Confirmaciones automáticas
              </h3>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Tus clientes reciben el detalle del turno
                apenas reservan.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <h3 className="font-semibold">
                Recordatorios inteligentes
              </h3>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Reducí ausencias y olvidos con mensajes
                automáticos.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <h3 className="font-semibold">
                Links directos de reserva
              </h3>

              <p className="mt-2 text-sm text-[var(--muted)]">
                Compartí tu perfil por Instagram,
                WhatsApp o QR.
              </p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto max-w-85">
          <div className="absolute inset-0 bg-brand/20 blur-3xl" />

          <div className="relative overflow-hidden rounded-[42px] border border-[var(--border)] bg-black shadow-2xl">
            <Image
              src="/screenshots/whatsapp-confirmation.png"
              alt="WhatsApp Central Turnos"
              width={340}
              height={680}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}