"use client";

import { useActionState, useRef, useState, startTransition } from "react";
import { Paperclip, SendHorizontal } from "lucide-react";

import type { SendResult } from "@/modules/chat";

type SendAction = (
  previous: SendResult | null,
  form: FormData,
) => Promise<SendResult>;

// Message box with "Attach CV" and starter suggestions. The server action
// enforces the free-message limit; `disabled` only mirrors it in the UI.
export function Composer({
  action,
  disabled,
  suggestions,
}: {
  action: SendAction;
  disabled: boolean;
  suggestions: string[];
}) {
  const [text, setText] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const [result, send, pending] = useActionState(
    async (previous: SendResult | null, form: FormData) => {
      const outcome = await action(previous, form);
      if (outcome.ok) setText("");
      return outcome;
    },
    null,
  );

  // Only the file name is sent for now; uploading goes through the storage
  // adapter once it exists.
  function attachCv(file: File | undefined) {
    if (!file) return;
    const form = new FormData();
    form.set("kind", "cv");
    form.set("text", file.name);
    startTransition(() => send(form));
    if (fileInput.current) fileInput.current.value = "";
  }

  const locked = disabled || pending;

  return (
    <div className="space-y-3">
      {suggestions.length > 0 && (
        <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setText(s)}
              className="bg-surface text-body border-suggestion-border shrink-0 rounded-full border px-4 py-2 text-sm"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form action={send} className="flex items-center gap-2">
        <input type="hidden" name="kind" value="text" />
        <input
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={locked}
          placeholder={disabled ? "Free messages used" : "Write a message…"}
          aria-label="Message"
          className="bg-surface shadow-card text-body h-14 min-w-0 flex-1 rounded-3xl px-5 outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={locked || !text.trim()}
          aria-label="Send"
          className="bg-primary flex size-14 shrink-0 items-center justify-center rounded-full text-white transition-opacity duration-200 disabled:opacity-40"
        >
          <SendHorizontal className="size-6" aria-hidden />
        </button>
      </form>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={locked}
          onClick={() => fileInput.current?.click()}
          className="border-primary bg-surface text-subtle rounded-button inline-flex h-11 items-center gap-2 border-[1.5px] px-4 text-sm font-semibold disabled:opacity-40"
        >
          <Paperclip className="text-primary size-4" aria-hidden />
          Attach CV
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => attachCv(e.target.files?.[0])}
        />
        {result && !result.ok && (
          <p role="alert" className="text-danger text-sm">
            {result.error}
          </p>
        )}
      </div>
    </div>
  );
}
