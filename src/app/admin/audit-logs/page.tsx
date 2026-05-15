"use client";

import { useCallback,useEffect, useState } from "react";

type AuditLog = {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  message: string;
  severity: "info" | "warning" | "error";
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  tenant?: {
    name: string;
    slug: string;
  };
  actor?: {
    fullName: string;
    email: string;
    role: string;
  };
  metadata?: Record<string, unknown>;
};

const severityStyles = {
  info: "border-blue-900 bg-blue-950 text-blue-400",
  warning: "border-yellow-900 bg-yellow-950 text-yellow-400",
  error: "border-red-900 bg-red-950 text-red-400",
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [severity, setSeverity] = useState("");
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (severity) params.set("severity", severity);
      if (action) params.set("action", action);

      const response = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const data = await response.json();

      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [severity, action]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadLogs();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadLogs]);

  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-white">
      <section className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">Auditoría y logs</h1>

        <p className="mt-2 text-neutral-400">
          Registro de acciones importantes del sistema.
        </p>

        <div className="mt-8 grid gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 md:grid-cols-2">
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
          >
            <option value="">Todas las severidades</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>

          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3"
            placeholder="Filtrar por acción. Ej: appointment.created"
          />
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
          {loading ? (
            <p className="p-6 text-neutral-400">Cargando logs...</p>
          ) : logs.length === 0 ? (
            <p className="p-6 text-neutral-400">No hay logs para mostrar.</p>
          ) : (
            <div className="divide-y divide-neutral-800">
              {logs.map((log) => (
                <div key={log._id} className="grid gap-5 p-5 md:grid-cols-[1fr_1.2fr_1fr]">
                  <div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                        severityStyles[log.severity]
                      }`}
                    >
                      {log.severity}
                    </span>

                    <p className="mt-3 font-medium">{log.action}</p>

                    <p className="mt-1 text-sm text-neutral-500">
                      {new Date(log.createdAt).toLocaleString("es-AR")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-neutral-500">Mensaje</p>
                    <p className="mt-1 text-sm text-neutral-300">
                      {log.message || "Sin mensaje"}
                    </p>

                    <p className="mt-3 text-xs text-neutral-500">
                      {log.entityType} · {log.entityId}
                    </p>

                    {log.tenant && (
                      <p className="mt-1 text-xs text-neutral-500">
                        Tenant: {log.tenant.name} / {log.tenant.slug}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-neutral-500">Actor</p>
                    <p className="mt-1 text-sm text-neutral-300">
                      {log.actor?.email || "Sistema / usuario público"}
                    </p>

                    <p className="mt-3 text-xs text-neutral-500">
                      IP: {log.ipAddress || "N/A"}
                    </p>

                    {log.metadata && (
                      <pre className="mt-3 max-h-32 overflow-auto rounded-xl bg-neutral-950 p-3 text-xs text-neutral-400">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
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