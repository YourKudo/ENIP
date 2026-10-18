import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { ButtonLink } from "@/components/button-link";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "CV review" };

const instantBenefits = [
  "Compare your resume with a specific job description",
  "See a role match score and criteria by criteria findings",
  "Keep completed results in your account",
];

export default function CvReviewPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-eyebrow">CV REVIEW</p>
        <h1 className="text-title mt-2">
          Make your next application stronger.
        </h1>
        <p className="text-body mt-3">
          Get practical feedback through an alumni conversation or compare your
          resume with a role you’re targeting.
        </p>
      </header>

      <div className="mt-8 grid gap-5 md:grid-cols-2 md:gap-6">
        <section className="card border-line flex flex-col border p-6 sm:p-8">
          <div className="bg-chip text-primary flex size-12 items-center justify-center rounded-2xl">
            <MessageCircle aria-hidden className="size-6" />
          </div>
          <h2 className="text-card-title mt-5">Alumni review</h2>
          <p className="text-body mt-2">
            Talk through your resume with a senior who understands your field
            and career path.
          </p>
          <ul className="mt-5 space-y-3">
            {[
              "Ask questions about roles and career decisions",
              "Get human perspective from someone with relevant experience",
              "Continue the conversation through ENIP chat",
            ].map((benefit) => (
              <li key={benefit} className="text-body flex gap-2 text-sm">
                <CheckCircle2
                  className="text-alumni mt-0.5 size-4 shrink-0"
                  aria-hidden
                />
                {benefit}
              </li>
            ))}
          </ul>
          <p className="text-meta bg-bg mt-5 rounded-2xl px-4 py-3">
            ENIP chat currently sends a resume filename only. Direct file
            sharing is not available yet, so don’t send personal resume details
            in chat.
          </p>
          <div className="mt-auto pt-6">
            <ButtonLink href={routes.search("resume review")} fullWidth>
              Find a senior <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          </div>
        </section>

        <section className="card border-line flex flex-col border p-6 sm:p-8">
          <div className="bg-chip text-primary flex size-12 items-center justify-center rounded-2xl">
            <Sparkles aria-hidden className="size-6" />
          </div>
          <h2 className="text-card-title mt-5">Instant role match</h2>
          <p className="text-body mt-2">
            Get an automated comparison between your resume and a job
            description you provide.
          </p>
          <p className="text-meta bg-bg mt-3 rounded-2xl px-4 py-3">
            Your first role match is free. Sign up to use points for future
            reviews.
          </p>
          <ul className="mt-5 space-y-3">
            {instantBenefits.map((benefit) => (
              <li key={benefit} className="text-body flex gap-2 text-sm">
                <CheckCircle2
                  className="text-alumni mt-0.5 size-4 shrink-0"
                  aria-hidden
                />
                {benefit}
              </li>
            ))}
          </ul>
          <p className="text-meta bg-bg mt-5 rounded-2xl px-4 py-3">
            An automated signal to guide your edits; it does not guarantee an
            interview or replace advice from a person.
          </p>
          <div className="mt-auto pt-6">
            <ButtonLink
              href={routes.cvReviewInstant}
              variant="secondary"
              fullWidth
            >
              Start an instant review{" "}
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          </div>
        </section>
      </div>
    </main>
  );
}
