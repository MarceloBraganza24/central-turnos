import { sendWhatsAppText } from "@/lib/whatsapp";

export async function sendProfileCompletedWhatsApp({
  to,
  tenantSlug,
}: {
  to: string;
  tenantSlug: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return sendWhatsAppText({
    to,
    entityId: tenantSlug,
    message: `Buenísimo 👏

Tu perfil profesional ya está cargado en Central Turnos.

Siguiente paso:
cargá tus horarios de atención para que tus clientes puedan reservar.

${appUrl}/dashboard/availability`,
  });
}

export async function sendAvailabilityCompletedWhatsApp({
  to,
  tenantSlug,
}: {
  to: string;
  tenantSlug: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return sendWhatsAppText({
    to,
    entityId: tenantSlug,
    message: `Excelente 👏

Ya tenés horarios cargados.

Ahora compartí tu link público con tus clientes:

${appUrl}/t/${tenantSlug}

También podés descargar tu QR desde:
${appUrl}/dashboard/share`,
  });
}

export async function sendFirstAppointmentWhatsApp({
  to,
  tenantSlug,
}: {
  to: string;
  tenantSlug: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return sendWhatsAppText({
    to,
    entityId: tenantSlug,
    message: `¡Felicitaciones! 🎉

Recibiste tu primer turno en Central Turnos.

Podés verlo desde tu calendario:
${appUrl}/dashboard/calendar`,
  });
}