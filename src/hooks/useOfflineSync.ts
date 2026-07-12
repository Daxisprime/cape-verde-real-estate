"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { getAllQueuedSubmissions, flushOfflineQueue } from "@/lib/offline-queue";

export interface SyncStatus {
  online: boolean;
  pendingCount: number;
  syncing: boolean;
}

export function useOfflineSync() {
  const { user } = useSupabaseAuth();
  const [status, setStatus] = useState<SyncStatus>({
    online: typeof navigator !== "undefined" ? navigator.onLine : true,
    pendingCount: 0,
    syncing: false,
  });
  const syncingRef = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    try {
      const items = await getAllQueuedSubmissions();
      setStatus((s) => ({ ...s, pendingCount: items.length }));
    } catch {
      // IndexedDB might not be available (SSR)
    }
  }, []);

  const attemptSync = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine || !user) return;
    syncingRef.current = true;
    setStatus((s) => ({ ...s, syncing: true }));

    try {
      const supabase = createSupabaseBrowserClient();
      if (supabase) {
        await flushOfflineQueue(supabase);
      }
    } catch {
      // Will retry on next online event
    } finally {
      syncingRef.current = false;
      await refreshPendingCount();
      setStatus((s) => ({ ...s, syncing: false }));
    }
  }, [user, refreshPendingCount]);

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = () => {
      setStatus((s) => ({ ...s, online: true }));
      attemptSync();
    };

    const handleOffline = () => {
      setStatus((s) => ({ ...s, online: false }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Also check periodically for any pending items
    const interval = setInterval(() => {
      refreshPendingCount();
      if (navigator.onLine) attemptSync();
    }, 30000);

    // Attempt sync on mount if online
    if (navigator.onLine) attemptSync();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [attemptSync, refreshPendingCount]);

  return status;
}
