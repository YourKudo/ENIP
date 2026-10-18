import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { db } from "@/adapters/db";
import { ButtonLink } from "@/components/button-link";
import { PageSkeleton } from "@/components/page-skeleton";
import { routes } from "@/lib/routes";
import {
  hashGuestCvReviewToken,
  readGuestCvReviewToken,
} from "@/modules/cv-review/guest-session";
import { getCurrentStudent } from "@/modules/students";

export const metadata: Metadata = { title: "CV review result" };

const statusLabels = {
  ideal: "Strong match",
  potential: "Partial match",
  not_mentioned: "Not mentioned",
  not_valid: "Not a match",
} as const;

// Results are scoped to the signed-in student or the guest cookie.
export default function CvReviewResultPage({
  params,
}: PageProps<"/cv-review/instant/[reviewId]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CvReviewResult params={params} />
    </Suspense>
  );
}

async function CvReviewResult({
  params,
}: Pick<PageProps<"/cv-review/instant/[reviewId]">, "params">) {
  const student = await getCurrentStudent();
  const { reviewId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(reviewId)) notFound();

  let review = student
    ? await db.cvReviews.getForStudent(reviewId, student.id)
    : null;
  if (!review) {
    const guestToken = await readGuestCvReviewToken();
    if (guestToken) {
      review = await db.cvReviews.getForGuest(
        reviewId,
        hashGuestCvReviewToken(guestToken),
      );
    }
  }
  if (!review) {
    if (!student) redirect(routes.join(routes.cvReviewResult(reviewId)));
    notFound();
  }
  const balance = review.studentId
    ? await db.points.balance(review.studentId)
    : null;

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:px-6 sm:py-12">
      <p className="text-eyebrow">INSTANT CV REVIEW</p>
      <h1 className="text-title mt-2">Your role match</h1>
      <p className="text-body mt-2">Target role: {review.targetRole}</p>

      <section className="card border-line mt-6 border p-6 sm:p-8">
        <p className="text-meta">Automated role match score</p>
        <p className="text-primary mt-1 text-5xl font-bold tracking-tight">
          {Math.round(review.result.score * 100)}%
        </p>
        <p className="text-body mt-5">{review.result.summary}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-card-title">Role criteria</h2>
        <ul className="mt-4 space-y-3">
          {review.result.evaluatedCriteria.map((criterion) => (
            <li key={criterion.id} className="card border-line border p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-ink font-semibold">{criterion.label}</h3>
                <span className="bg-chip text-primary rounded-full px-3 py-1 text-xs font-semibold">
                  {statusLabels[criterion.matchStatus]}
                </span>
              </div>
              {(criterion.isMandatory || criterion.threshold) && (
                <p className="text-meta mt-2">
                  {[
                    criterion.isMandatory && "Required",
                    criterion.threshold && `Asks for: ${criterion.threshold}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              <p className="text-body mt-2 text-sm">
                {criterion.matchExplanation}
              </p>
              {criterion.evidence && (
                <blockquote className="border-line text-subtle mt-3 border-l-2 pl-3 text-sm italic">
                  From your resume: “{criterion.evidence}”
                </blockquote>
              )}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-meta mt-6">
        Findings are shown as returned by the review service. This automated
        comparison is a guide, not a hiring decision.
      </p>
      <p className="text-meta mt-2">
        Completed {new Date(review.createdAt).toLocaleString()} ·{" "}
        {review.studentId
          ? `${review.cost} ENIP points charged · ${balance} points remaining. Reopening a saved result does not charge points again.`
          : "Complimentary first review. Sign up to use points for future reviews."}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {review.studentId ? (
          <ButtonLink href={routes.cvReviewInstant}>
            Review another role
          </ButtonLink>
        ) : (
          <ButtonLink href={routes.join(routes.cvReviewInstant)}>
            Sign up to continue
          </ButtonLink>
        )}
        <ButtonLink href={routes.cvReview} variant="secondary">
          CV review options
        </ButtonLink>
      </div>
    </main>
  );
}
