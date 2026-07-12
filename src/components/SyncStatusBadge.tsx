"use client";

import { Wifi, WifiOff, Loader2, CheckCircle } from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export default function SyncStatusBadge() {
  const { online, pendingCount, syncing } = useOfflineSync();

  if (!online) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full">
        <WifiOff className="w-3.5 h-3.5 text-amber-600" />
        <span className="text-[11px] font-semibold text-amber-700">
          Offline {pendingCount > 0 ? `(${pendingCount} Pendente)` : ""}
        </span>
      </div>
    );
  }

  if (syncing) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full">
        <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
        <span className="text-[11px] font-semibold text-blue-700">A sincronizar...</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full">
        <Wifi className="w-3.5 h-3.5 text-amber-600" />
        <span className="text-[11px] font-semibold text-amber-700">
          {pendingCount} Pendente
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
      <span className="text-[11px] font-semibold text-emerald-700">Sincronizado</span>
    </div>
  );
}
