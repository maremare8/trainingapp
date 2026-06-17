"use client";

import { useEffect } from "react";

/**
 * Registers the service worker on the client. Rendered once in the root layout.
 * Also tells the SW to proactively cache workout data for offline access.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        // Once active, tell the SW to cache workouts proactively.
        const sw = reg.active || reg.installing || reg.waiting;
        if (sw) {
          sw.addEventListener("statechange", () => {
            if (sw.state === "activated") cacheWorkouts();
          });
          if (sw.state === "activated") cacheWorkouts();
        }
      } catch {
        // Registration failures are non-fatal.
      }
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", () => register());
    }
  }, []);

  return null;
}

/** Ask the service worker to prefetch and cache the user's workouts. */
function cacheWorkouts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return;

  // Get the auth token from localStorage (Supabase stores it there)
  const storageKey = Object.keys(localStorage).find((k) =>
    k.startsWith("sb-") && k.endsWith("-auth-token")
  );
  if (!storageKey) return;
  
  try {
    const session = JSON.parse(localStorage.getItem(storageKey) || "{}");
    const accessToken = session?.access_token;
    if (!accessToken) return;

    navigator.serviceWorker.controller?.postMessage({
      type: "CACHE_WORKOUTS",
      url: `${supabaseUrl}/rest/v1/workouts?select=*,exercises(*)&order=updated_at.desc`,
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    // Ignore parse errors
  }
}
