import { headers } from "next/headers";
import { AuditLog } from "@/models/AuditLog";

type CreateAuditLogParams = {
  tenant?: string | null;
  actor?: string | null;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  severity?: "info" | "warning" | "error";
};

export async function createAuditLog({
  tenant = null,
  actor = null,
  actorRole = "system",
  action,
  entityType,
  entityId = "",
  message = "",
  metadata = {},
  severity = "info",
}: CreateAuditLogParams) {
  try {
    const headersList = await headers();

    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      "";

    const userAgent = headersList.get("user-agent") || "";

    await AuditLog.create({
      tenant,
      actor,
      actorRole,
      action,
      entityType,
      entityId,
      message,
      metadata,
      severity,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
}