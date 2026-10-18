"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { routes } from "@/lib/routes";

export function GuestSessionBootstrap() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(routes.cvReviewGuestStart, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Could not start a free review.");
        return response.json();
      })
      .then(() => {
        if (active) router.refresh();
      })
      .catch(() => {
        if (active) setError("Couldn’t prepare the free review. Try again.");
      });
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="mx-auto max-w-2xl px-5 py-12 text-center sm:px-6">
      <p className="text-eyebrow">INSTANT REVIEW</p>
      <h1 className="text-title mt-2">Preparing your free first review</h1>
      <p className="text-body mt-3" role={error ? "alert" : "status"}>
        {error || "One moment…"}
      </p>
      {error && (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-primary focus-visible:outline-primary mt-4 font-semibold underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Try again
        </button>
      )}
    </main>
  );
}
