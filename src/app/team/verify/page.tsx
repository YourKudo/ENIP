import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { OtpForm } from "@/components/onboarding/otp-form";
import { PageSkeleton } from "@/components/page-skeleton";
import { BackButton } from "@/components/ui/back-button";
import { routes } from "@/lib/routes";
import { getMaskedTeamPendingEmail } from "@/modules/team";
import { teamResendAction, teamVerifyAction } from "../actions";

export const metadata: Metadata = { title: "Team code" };

export default function TeamVerifyPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TeamVerify />
    </Suspense>
  );
}

async function TeamVerify() {
  const maskedEmail = await getMaskedTeamPendingEmail();
  if (!maskedEmail) redirect(routes.teamSignIn);

  return (
    <div className="mx-auto max-w-[480px] px-6 py-8">
      <BackButton href={routes.teamSignIn} label="Change email" />
      <h1 className="text-title mt-6">Check your email</h1>
      <p className="text-body mt-2">
        We sent a 6-digit code to{" "}
        <span className="text-ink font-semibold">{maskedEmail}</span>.
      </p>
      <OtpForm action={teamVerifyAction} resend={teamResendAction} />
    </div>
  );
}
