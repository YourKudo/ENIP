"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { buttonClasses } from "@/components/button-link";
import { routes } from "@/lib/routes";

type ResponseBody =
  | { ok: true; reviewId: string; balance?: number }
  | {
      ok: false;
      code: string;
      message: string;
      balance?: number;
      retryable: boolean;
    };

const MAX_FILE_BYTES = 4_500_000;

export function InstantReviewForm({
  mode,
  cost,
  balance,
  providerConfigured,
}: {
  mode: "guest" | "member";
  cost: number | null;
  balance: number;
  providerConfigured: boolean;
}) {
  const router = useRouter();
  const idempotencyKey = useRef<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [availableBalance, setAvailableBalance] = useState(balance);

  const unavailable =
    !providerConfigured || (mode === "member" && cost === null);
  const insufficient =
    mode === "member" && cost !== null && availableBalance < cost;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || unavailable || insufficient) return;
    const form = event.currentTarget;
    const file = (form.elements.namedItem("resume") as HTMLInputElement)
      .files?.[0];
    if (!file) {
      setError("Choose a resume file to continue.");
      return;
    }
    if (file.size >= MAX_FILE_BYTES) {
      setError("Choose a file smaller than 4.5 MB.");
      return;
    }

    if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();
    const data = new FormData(form);
    data.set("idempotencyKey", idempotencyKey.current);
    setPending(true);
    setError("");
    try {
      const response = await fetch(routes.cvReviewInstantApi, {
        method: "POST",
        body: data,
      });
      if (response.status === 401) {
        if (mode === "guest") window.location.assign(routes.cvReviewInstant);
        else router.push(routes.join(routes.cvReviewInstant));
        return;
      }
      const body = (await response.json()) as ResponseBody;
      if (body.ok) {
        router.push(routes.cvReviewResult(body.reviewId));
        router.refresh();
        return;
      }
      if (typeof body.balance === "number") setAvailableBalance(body.balance);
      setError(body.message);
      if (body.code !== "already_processing") idempotencyKey.current = null;
    } catch {
      // Keep the same key so a retry returns the original result without
      // reserving or charging points a second time.
      setError("We couldn’t reach the review service. Try submitting again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="card mt-6 space-y-5">
      <div>
        <label
          htmlFor="targetRole"
          className="text-subtle block text-sm font-semibold"
        >
          Target role
        </label>
        <input
          id="targetRole"
          name="targetRole"
          required
          minLength={2}
          maxLength={120}
          placeholder="e.g. Product Analyst"
          className="border-line bg-surface text-body focus-visible:ring-primary mt-2 h-12 w-full rounded-2xl border px-4 outline-none focus-visible:ring-2"
        />
      </div>

      <div>
        <label
          htmlFor="jobDescription"
          className="text-subtle block text-sm font-semibold"
        >
          Job description
        </label>
        <textarea
          id="jobDescription"
          name="jobDescription"
          required
          minLength={20}
          maxLength={50_000}
          rows={7}
          placeholder="Paste the job description so we can compare your resume with its requirements."
          className="border-line bg-surface text-body focus-visible:ring-primary mt-2 w-full rounded-2xl border px-4 py-3 outline-none focus-visible:ring-2"
        />
      </div>

      <div>
        <label
          htmlFor="resume"
          className="text-subtle block text-sm font-semibold"
        >
          Resume
        </label>
        <input
          id="resume"
          name="resume"
          type="file"
          required
          accept=".pdf,.doc,.docx,.rtf,.txt"
          aria-describedby="resume-help"
          className="border-line bg-surface file:bg-chip file:text-primary focus-visible:outline-primary mt-2 block min-h-12 w-full rounded-2xl border px-3 py-2 text-sm file:mr-3 file:rounded-xl file:border-0 file:px-3 file:py-2 file:font-semibold focus-visible:outline-2 focus-visible:outline-offset-2"
        />
        <p id="resume-help" className="text-meta mt-2">
          PDF, DOC, DOCX, RTF or TXT. Under 4.5 MB. We don’t keep the uploaded
          file.
        </p>
      </div>

      <div className="border-line bg-bg rounded-2xl border px-4 py-3 text-sm">
        {mode === "guest" ? (
          <>
            <p className="text-ink font-semibold">
              Your first role match is free
            </p>
            <p className="text-muted mt-1">
              Sign up after this review to continue with ENIP points.
            </p>
          </>
        ) : (
          <>
            <p className="text-ink font-semibold">
              {cost === null
                ? "Points cost not set"
                : `${cost} ENIP points per review`}
            </p>
            <p className="text-muted mt-1">
              Available balance: {availableBalance} points. A charge is recorded
              only when a result is saved.
            </p>
          </>
        )}
      </div>

      {unavailable && (
        <p
          role="status"
          className="bg-chip text-subtle rounded-xl px-4 py-3 text-sm"
        >
          {mode === "member" && cost === null
            ? "Instant review will open when the ENIP points cost is configured."
            : "Instant review is temporarily unavailable."}
        </p>
      )}
      {insufficient && !unavailable && (
        <p
          role="status"
          className="bg-chip text-subtle rounded-xl px-4 py-3 text-sm"
        >
          You need {cost} points to run this review. Your current balance is{" "}
          {availableBalance}.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="text-danger rounded-xl bg-red-50 px-4 py-3 text-sm"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || unavailable || insufficient}
        className={buttonClasses("primary", true)}
      >
        {pending
          ? "Reviewing…"
          : mode === "guest"
            ? "Get my free role match"
            : "Review my resume"}
      </button>
      <p className="text-meta -mt-3 text-center">
        A review usually takes under a minute.
      </p>
    </form>
  );
}
