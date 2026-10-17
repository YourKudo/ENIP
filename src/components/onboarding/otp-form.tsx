"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

const LENGTH = 6;
const RESEND_SECONDS = 30;
const empty = () => Array<string>(LENGTH).fill("");

// Six boxed inputs (design spec). Typing or pasting the full code submits
// automatically; a wrong code clears the boxes for another try.
export function OtpForm({
  action,
  resend,
}: {
  action: (
    previous: { error: string } | null,
    form: FormData,
  ) => Promise<{ error: string } | null>;
  resend: () => Promise<{ ok: boolean; message: string }>;
}) {
  const [digits, setDigits] = useState(empty);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [resendNote, setResendNote] = useState<string | null>(null);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const form = useRef<HTMLFormElement>(null);

  const [state, verify, pending] = useActionState(
    async (previous: { error: string } | null, data: FormData) => {
      const result = await action(previous, data);
      if (result?.error) {
        setDigits(empty());
        boxes.current[0]?.focus();
      }
      return result;
    },
    null,
  );

  useEffect(() => {
    if (secondsLeft === 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  function fill(start: number, typed: string) {
    const incoming = typed.replace(/\D/g, "").slice(0, LENGTH - start);
    if (!incoming) return;
    const nextDigits = [...digits];
    [...incoming].forEach((d, i) => (nextDigits[start + i] = d));
    setDigits(nextDigits);
    const focusAt = Math.min(start + incoming.length, LENGTH - 1);
    boxes.current[focusAt]?.focus();
    if (nextDigits.every(Boolean) && !pending) {
      // Wait for React to write the digits into the hidden field.
      setTimeout(() => form.current?.requestSubmit());
    }
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Backspace") return;
    e.preventDefault();
    const nextDigits = [...digits];
    if (nextDigits[i]) {
      nextDigits[i] = "";
    } else if (i > 0) {
      nextDigits[i - 1] = "";
      boxes.current[i - 1]?.focus();
    }
    setDigits(nextDigits);
  }

  function requestNewCode() {
    startTransition(async () => {
      const result = await resend();
      setResendNote(result.message);
      if (result.ok) {
        setSecondsLeft(RESEND_SECONDS);
        setDigits(empty());
        boxes.current[0]?.focus();
      }
    });
  }

  return (
    <form ref={form} action={verify} className="mt-8">
      <input type="hidden" name="code" value={digits.join("")} />
      <div
        className="flex justify-between gap-2"
        role="group"
        aria-label="Verification code"
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              boxes.current[i] = el;
            }}
            value={digit}
            onChange={(e) => fill(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            autoFocus={i === 0}
            disabled={pending}
            aria-label={`Digit ${i + 1}`}
            aria-invalid={Boolean(state?.error)}
            className="bg-surface shadow-card text-ink focus:ring-primary-soft aria-[invalid=true]:ring-danger h-14 w-full min-w-0 rounded-2xl text-center text-2xl font-bold outline-none focus:ring-2 aria-[invalid=true]:ring-2"
          />
        ))}
      </div>

      <div className="mt-4 min-h-6 text-center text-sm" aria-live="polite">
        {pending ? (
          <span className="text-primary font-semibold">Verifying…</span>
        ) : state?.error ? (
          <span className="text-danger">{state.error}</span>
        ) : (
          resendNote && <span className="text-muted">{resendNote}</span>
        )}
      </div>

      <p className="text-meta mt-4 text-center">
        Didn&apos;t get it?{" "}
        {secondsLeft > 0 ? (
          <span>Resend in {secondsLeft}s</span>
        ) : (
          <button
            type="button"
            onClick={requestNewCode}
            className="text-primary font-semibold hover:underline"
          >
            Resend code
          </button>
        )}
      </p>
    </form>
  );
}
