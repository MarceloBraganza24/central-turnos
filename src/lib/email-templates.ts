export function brandedEmailLayout({
  title,
  body,
  ctaLabel,
  ctaUrl,
}: {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) {
  return `
  <div style="background:#0a0a0a;padding:32px;font-family:Arial,sans-serif;color:#ffffff;">
    <div style="max-width:560px;margin:0 auto;background:#171717;border:1px solid #262626;border-radius:24px;padding:32px;">
      <div style="font-size:14px;color:#8B5CF6;margin-bottom:16px;">Central Turnos</div>

      <h1 style="font-size:28px;line-height:1.2;margin:0 0 16px;color:#ffffff;">
        ${title}
      </h1>

      <div style="font-size:16px;line-height:1.6;color:#d4d4d4;">
        ${body}
      </div>

      ${
        ctaLabel && ctaUrl
          ? `<a href="${ctaUrl}" style="display:inline-block;margin-top:24px;background:#8B5CF6;color:#ffffff;text-decoration:none;padding:14px 20px;border-radius:12px;font-weight:bold;">
              ${ctaLabel}
            </a>`
          : ""
      }

      <p style="margin-top:32px;font-size:12px;color:#737373;">
        Este mensaje fue enviado por Central Turnos.
      </p>
    </div>
  </div>`;
}

export const emailTemplates = {
  welcomeProfessional: ({ name, url }: { name: string; url: string }) =>
    brandedEmailLayout({
      title: `Bienvenido/a, ${name}`,
      body: `
        <p>Gracias por registrarte en Central Turnos.</p>
        <p>Completá tu perfil, cargá tus horarios y compartí tu link para empezar a recibir reservas.</p>
      `,
      ctaLabel: "Configurar mi cuenta",
      ctaUrl: url,
    }),

  appointmentConfirmation: ({
    name,
    professional,
    date,
    time,
    url,
  }: {
    name: string;
    professional: string;
    date: string;
    time: string;
    url: string;
  }) =>
    brandedEmailLayout({
      title: "Tu turno fue reservado",
      body: `
        <p>Hola ${name}, tu turno con <strong>${professional}</strong> fue reservado.</p>
        <p><strong>Fecha:</strong> ${date}</p>
        <p><strong>Horario:</strong> ${time}</p>
      `,
      ctaLabel: "Ver detalle",
      ctaUrl: url,
    }),

  appointmentReminder: ({
    name,
    professional,
    date,
    time,
  }: {
    name: string;
    professional: string;
    date: string;
    time: string;
  }) =>
    brandedEmailLayout({
      title: "Recordatorio de turno",
      body: `
        <p>Hola ${name}, te recordamos tu turno con <strong>${professional}</strong>.</p>
        <p><strong>Fecha:</strong> ${date}</p>
        <p><strong>Horario:</strong> ${time}</p>
      `,
    }),

  paymentReceived: ({
    name,
    professional,
    url,
  }: {
    name: string;
    professional: string;
    url: string;
  }) =>
    brandedEmailLayout({
      title: "Pago recibido",
      body: `
        <p>Hola ${name}, recibimos el pago de tu seña.</p>
        <p>Tu turno con <strong>${professional}</strong> quedó confirmado.</p>
      `,
      ctaLabel: "Ver turno",
      ctaUrl: url,
    }),

  reviewRequest: ({
    name,
    professional,
    url,
  }: {
    name: string;
    professional: string;
    url: string;
  }) =>
    brandedEmailLayout({
      title: "¿Cómo fue tu atención?",
      body: `
        <p>Hola ${name}, gracias por asistir a tu turno con <strong>${professional}</strong>.</p>
        <p>Tu opinión ayuda a otros clientes a elegir mejor.</p>
      `,
      ctaLabel: "Dejar reseña",
      ctaUrl: url,
    }),
};