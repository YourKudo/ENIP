import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

import { LockedSection } from "@/components/locked";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "CV review" };

const benefits = [
  "A score on format, impact and relevance to your target role",
  "Line-by-line suggestions from a senior in your field",
  "A verified badge once your CV is reviewed",
];

export default function CvReviewPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">CV score & review</h1>
      <p className="mt-2 text-slate-600">
        Share your CV in a chat and a senior will score it and suggest
        improvements.
      </p>
      <ul className="mt-6 space-y-2">
        {benefits.map((b) => (
          <li key={b} className="flex gap-2 text-slate-700">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
            {b}
          </li>
        ))}
      </ul>
      <LockedSection access={{ kind: "signup" }} hiddenCount={2} returnTo={routes.cvReview} />
    </div>
  );
}
