"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

import { buttonClasses } from "@/components/button-link";

// Referral link with Copy and WhatsApp share, plus the short code for
// people who'd rather type it.
export function ShareReferral({ link, code }: { link: string; code: string }) {
  const [copied, setCopied] = useState<"link" | "code" | null>(null);
  const message = `Join me on ENIP, the network for IITians. Talk to seniors for placements, internships and CV help: ${link}`;

  async function copy(text: string, what: "link" | "code") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard can be blocked (e.g. non-HTTPS); the text is still visible.
    }
  }

  return (
    <div className="card space-y-4">
      <div>
        <p className="text-meta">Your invite link</p>
        <div className="mt-1.5 flex items-center gap-2">
          <p className="bg-chip text-ink min-w-0 flex-1 truncate rounded-2xl px-4 py-3 text-sm font-medium">
            {link}
          </p>
          <button
            type="button"
            onClick={() => copy(link, "link")}
            aria-label="Copy invite link"
            className="bg-primary flex size-11 shrink-0 items-center justify-center rounded-full text-white"
          >
            {copied === "link" ? (
              <Check className="size-5" aria-hidden />
            ) : (
              <Copy className="size-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses("primary", true)}
      >
        <Share2 className="size-5" aria-hidden />
        Invite on WhatsApp
      </a>

      <p className="text-meta text-center">
        Or share your code{" "}
        <button
          type="button"
          onClick={() => copy(code, "code")}
          className="text-primary font-mono font-bold tracking-widest underline-offset-2 hover:underline"
        >
          {code}
        </button>
        {copied === "code" && <span className="text-alumni"> copied</span>}
      </p>
    </div>
  );
}
