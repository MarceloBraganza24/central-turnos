"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type PendingSummary = {
  count: number;
  latestPending: {
    _id: string;
    appointmentDate: string;
    startTime: string;
    clientName: string;
  } | null;
};

export default function PendingAppointmentsNotifier() {
  const router = useRouter();

  const [pendingCount, setPendingCount] = useState(0);
  const previousCountRef = useRef(0);
  const initializedRef = useRef(false);

  const loadPendingSummary = useCallback(async () => {
    try {
            const response = await fetch("/api/appointments/pending-summary", {
    cache: "no-store",
    });

    const text = await response.text();

    let data: PendingSummary | null = null;

    try {
    data = text ? (JSON.parse(text) as PendingSummary) : null;
    } catch {
    console.error("Respuesta no JSON:", text);
    return;
    }

    if (!response.ok || !data) return;

        const count = Number(data.count || 0);

        if (
        initializedRef.current &&
        count > previousCountRef.current &&
        data.latestPending
        ) {
        toast.warning("Nuevo turno pendiente", {
            description: `${data.latestPending.clientName} · ${data.latestPending.appointmentDate} · ${data.latestPending.startTime}`,
            action: {
            label: "Ver",
            onClick: () => {
                router.push(
                `/dashboard/calendar?appointment=${data.latestPending?._id}`
                );
            },
            },
        });
        }

        previousCountRef.current = count;
        initializedRef.current = true;
        setPendingCount(count);
    } catch (error) {
        console.error(error);
    }
    }, [router]);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
        void loadPendingSummary();
    }, 0);

    const interval = window.setInterval(() => {
        void loadPendingSummary();
    }, 30000);

    return () => {
        window.clearTimeout(initialTimer);
        window.clearInterval(interval);
    };
    }, [loadPendingSummary]);

  if (pendingCount === 0) return null;

  return (
    <Link
      href="/dashboard/calendar?pending=true"
      className="fixed bottom-6 right-20 z-50 rounded-2xl border border-yellow-300 bg-yellow-50 px-5 py-4 text-sm font-medium text-yellow-950 shadow-xl transition hover:bg-yellow-100"
    >
      ⚠️ {pendingCount} turno{pendingCount === 1 ? "" : "s"} pendiente
      {pendingCount === 1 ? "" : "s"}
    </Link>
  );
}