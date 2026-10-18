import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import { db } from "@/adapters/db";
import { isHireLayerConfigured } from "@/adapters/hirelayer";
import { ButtonLink } from "@/components/button-link";
import { PageSkeleton } from "@/components/page-skeleton";
import { InstantReviewForm } from "@/components/cv-review/instant-review-form";
import { GuestSessionBootstrap } from "@/components/cv-review/guest-session-bootstrap";
import { INSTANT_CV_REVIEW_COST } from "@/config/rules";
import { routes } from "@/lib/routes";
import {
  hashGuestCvReviewToken,
  readGuestCvReviewToken,
} from "@/modules/cv-review/guest-session";
import { getCurrentStudent } from "@/modules/students";

export const metadata: Metadata = { title: "Instant CV review" };

// Reads the session and guest cookie, so it renders per request.
export default function InstantCvReviewPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <InstantCvReview />
    </Suspense>
  );
}

async function InstantCvReview() {
  const student = await getCurrentStudent();
  let balance = 0;
  let isGuest = false;
  let guestStatus: "available" | "processing" | "failed" | "completed" | null =
    null;
  let guestReviewId: string | null = null;

  if (student) {
    balance = await db.points.balance(student.id);
  } else {
    const token = await readGuestCvReviewToken();
    if (!token) return <GuestSessionBootstrap />;
    const claim = await db.cvReviews.getGuestClaim(
      hashGuestCvReviewToken(token),
    );
    if (!claim) return <GuestSessionBootstrap />;
    isGuest = true;
    guestStatus = claim.status;
    guestReviewId = claim.id;
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:px-6 sm:py-12">
      <Link
        href={routes.cvReview}
        className="text-primary focus-visible:outline-primary text-sm font-semibold hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        ← CV review options
      </Link>
      <p className="text-eyebrow mt-7">INSTANT REVIEW</p>
      <h1 className="text-title mt-2">Compare your resume with a role.</h1>
      <p className="text-body mt-3">
        Add a target role and job description, then upload your resume.{" "}
        {student
          ? "This review uses ENIP points and is charged only when the result is saved."
          : "Your first role match in this browser is free; future reviews use ENIP points after signup."}
      </p>
      <p className="text-meta mt-3">
        Your resume is sent to HireLayer for processing with its no-storage
        option. ENIP does not save the uploaded file. The saved result contains
        only the role and review findings.
      </p>
      {isGuest && guestStatus === "completed" && guestReviewId ? (
        <section className="card border-line mt-6 space-y-4 border p-6">
          <h2 className="text-card-title">Your free review is complete</h2>
          <p className="text-body">
            You’ve used your one complimentary role match. Sign up to continue
            with points for future reviews.
          </p>
          <ButtonLink href={routes.cvReviewResult(guestReviewId)} fullWidth>
            View your free result
          </ButtonLink>
          <ButtonLink
            href={routes.join(routes.cvReviewInstant)}
            variant="secondary"
            fullWidth
          >
            Sign up to continue
          </ButtonLink>
        </section>
      ) : isGuest && guestStatus === "processing" ? (
        <section className="card border-line mt-6 space-y-3 border p-6">
          <h2 className="text-card-title">Your free review is running</h2>
          <p className="text-body">
            Refresh this page in a moment to see your result.
          </p>
        </section>
      ) : (
        <InstantReviewForm
          mode={isGuest ? "guest" : "member"}
          cost={INSTANT_CV_REVIEW_COST}
          balance={balance}
          providerConfigured={isHireLayerConfigured()}
        />
      )}
    </main>
  );
}
