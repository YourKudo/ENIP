"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Re-fetches the page every few seconds so new replies appear. Simple
// polling is enough for V1; live updates can replace it inside this file.
export function AutoRefresh({ everyMs }: { everyMs: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, everyMs);
    return () => clearInterval(id);
  }, [router, everyMs]);
  return null;
}
