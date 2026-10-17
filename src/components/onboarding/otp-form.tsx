"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import { buttonClasses } from "@/components/button-link";

const LENGTH = 6;
const RESEND_SECONDS = 30;
const empty = () => Array<string>(LENGTH).fill("");

// Six boxed inputs (design spec), one digit each. Pasting or autofilling the
// code fills every box; a full code submits by itself, and the Verify
// button is there as a fallback. A wrong code clears the boxes.
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
  const lastSubmitted = useRef<string | null>(null);

  const [state, verify, pending] = useActionState(
    async (previous: { error: string } | null, data: FormData) => {
      const result = await action(previous, data);
      if (result?.error) {
        lastSubmitted.current = null; // allow retrying the same code
        setDigits(empty());
        boxes.current[0]?.focus();
      }
      return result;
    },
    null,
  );

  const code = digits.join("");
  const complete = code.length === LENGTH;

  // Submit once when the last box is filled. Runs after React has written
  // the digits into the hidden field, so the right code is sent.
  useEffect(() => {
    if (complete && !pending && lastSubmitted.current !== code) {
      lastSubmitted.current = code;
      form.current?.requestSubmit();
    }
  }, [complete, code, pending]);

  useEffect(() => {
    if (secondsLeft === 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const focusBox = (i: number) =>
    boxes.current[Math.max(0, Math.min(i, LENGTH - 1))]?.focus();

  // Puts several digits in a row of boxes. A full code always starts at the
  // first box, whichever box it was pasted into.
  function spread(start: number, raw: string) {
    const incoming = raw.replace(/\D/g, "");
    if (!incoming) return;
    const from = incoming.length >= LENGTH ? 0 : start;
    const next = [...digits];
    [...incoming.slice(0, LENGTH - from)].forEach((d, k) => {
      next[from + k] = d;
    });
    setDigits(next);
    const firstEmpty = next.findIndex((d) => !d);
    focusBox(firstEmpty === -1 ? LENGTH - 1 : firstEmpty);
  }

  function onChange(i: number, value: string) {
    const typed = value.replace(/\D/g, "");
    if (typed.length <= 1) {
      // One key: the box holds exactly this digit (or is cleared).
      const next = [...digits];
      next[i] = typed;
      setDigits(next);
      if (typed) focusBox(i + 1);
      return;
    }
    if (typed.length === 2 && digits[i]) {
      // Typed into a filled box: keep only the new digit.
      const fresh = typed[0] === digits[i] ? typed[1] : typed[0];
      const next = [...digits];
      next[i] = fresh;
      setDigits(next);
      focusBox(i + 1);
      return;
    }
    spread(i, typed); // phone autofill inserting the whole code
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowLeft") return focusBox(i - 1);
    if (e.key === "ArrowRight") return focusBox(i + 1);
    if (e.key !== "Backspace") return;
    e.preventDefault();
    const next = [...digits];
    if (next[i]) {
      next[i] = "";
    } else if (i > 0) {
      next[i - 1] = "";
      focusBox(i - 1);
    }
    setDigits(next);
  }

  function requestNewCode() {
    startTransition(async () => {
      const result = await resend();
      setResendNote(result.message);
      if (result.ok) {
        setSecondsLeft(RESEND_SECONDS);
        lastSubmitted.current = null;
        setDigits(empty());
        focusBox(0);
      }
    });
  }

  return (
    <form ref={form} action={verify} className="mt-8">
      <input type="hidden" name="code" value={code} />
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
            onChange={(e) => onChange(i, e.target.value)}
            onPaste={(e) => {
              e.preventDefault();
              spread(i, e.clipboardData.getData("text"));
            }}
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
        {state?.error && !pending ? (
          <span className="text-danger">{state.error}</span>
        ) : (
          resendNote && <span className="text-muted">{resendNote}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={!complete || pending}
        className={`${buttonClasses("primary", true)} mt-2`}
      >
        {pending ? "Verifying…" : "Verify"}
      </button>

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
