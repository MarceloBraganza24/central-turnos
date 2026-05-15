import { sendWhatsAppText } from "@/lib/whatsapp";

type SendProfessionalWelcomeParams = {
  to: string;
  fullName: string;
  tenantSlug: string;
};

export async function sendProfessionalWelcomeWhatsApp({
  to,
  fullName,
  tenantSlug,
}: SendProfessionalWelcomeParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const onboardingUrl = `${appUrl}/dashboard/onboarding`;
  const profileUrl = `${appUrl}/dashboard/profile`;
  const availabilityUrl = `${appUrl}/dashboard/availability`;
  const publicUrl = `${appUrl}/t/${tenantSlug}`;

  const message = `Hola ${fullName} 👋

Gracias por registrarte en Central Turnos.

Para dejar tu espacio listo, seguí estos pasos:

1️⃣ Completá tu perfil profesional
${profileUrl}

2️⃣ Cargá tus horarios de atención
${availabilityUrl}

3️⃣ Compartí tu link público con tus clientes
${publicUrl}

También podés ver la guía completa acá:
${onboardingUrl}

Cuando termines esos pasos, ya vas a poder recibir reservas online.`;

  return sendWhatsAppText({
    to,
    message,
    entityId: tenantSlug,
  });
}