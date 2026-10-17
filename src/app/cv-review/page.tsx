import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

import { BlurLock } from "@/components/locked";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "CV review" };

const benefits = [
  "A score on format, impact and relevance to your target role",
  "Line-by-line suggestions from a senior in your field",
  "A verified badge once your CV is reviewed",
];

export default function CvReviewPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-title">CV score & review</h1>
      <p className="text-body mt-2">
        Share your CV in a chat and a senior will score it and suggest
        improvements.
      </p>
      <ul className="mt-6 space-y-2">
        {benefits.map((b) => (
          <li key={b} className="text-body flex gap-2">
            <CheckCircle2
              className="text-alumni mt-0.5 size-5 shrink-0"
              aria-hidden
            />
            {b}
          </li>
        ))}
      </ul>
      <BlurLock
        access={{ kind: "signup" }}
        hiddenCount={2}
        returnTo={routes.cvReview}
      />
    </div>
  );
}
