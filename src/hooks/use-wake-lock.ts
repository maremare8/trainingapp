"use client";

import { useEffect, useRef } from "react";

/**
 * Requests a screen wake lock while the component is mounted (and the tab is
 * visible). Silently does nothing on browsers without support.
 */
export function useWakeLock(enabled: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let cancelled = false;

    async function acquire() {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          lock.release().catch(() => undefined);
          return;
        }
        lockRef.current = lock;
        lock.addEventListener("release", () => {
          lockRef.current = null;
        });
      } catch {
        // Permissions or feature unavailable — silently degrade.
      }
    }

    function onVisibility() {
      if (document.visibilityState === "visible" && !lockRef.current) {
        void acquire();
      }
    }

    void acquire();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      lockRef.current?.release().catch(() => undefined);
      lockRef.current = null;
    };
  }, [enabled]);
}
