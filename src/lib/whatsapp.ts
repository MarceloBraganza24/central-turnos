import { safeRequest } from "@/lib/safe-request";
import { createAuditLog } from "@/lib/audit";

type SendWhatsAppTextParams = {
  to: string;
  message: string;
  tenant?: string | null;
  entityId?: string;
};

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export async function sendWhatsAppText({
  to,
  message,
  tenant = null,
  entityId = "",
}: SendWhatsAppTextParams) {
  const version = process.env.WHATSAPP_API_VERSION || "v20.0";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    await createAuditLog({
      tenant,
      actorRole: "system",
      action: "whatsapp.not_configured",
      entityType: "WhatsApp",
      entityId,
      message: "WhatsApp API no configurada",
      severity: "warning",
    });

    return { success: false, error: "WhatsApp API no configurada" };
  }

  const result = await safeRequest(
    async () => {
      const response = await fetch(
        `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: normalizePhone(to),
            type: "text",
            text: {
              preview_url: false,
              body: message,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      return data;
    },
    {
      retries: 2,
      timeoutMs: 10000,
      retryDelayMs: 1000,
    }
  );

  if (!result.success) {
    await createAuditLog({
      tenant,
      actorRole: "system",
      action: "whatsapp.failed",
      entityType: "WhatsApp",
      entityId,
      message: "Falló el envío de WhatsApp",
      metadata: {
        to: normalizePhone(to),
        error: result.error,
      },
      severity: "error",
    });

    return result;
  }

  await createAuditLog({
    tenant,
    actorRole: "system",
    action: "whatsapp.sent",
    entityType: "WhatsApp",
    entityId,
    message: "WhatsApp enviado correctamente",
    metadata: {
      to: normalizePhone(to),
    },
  });

  return result;
}