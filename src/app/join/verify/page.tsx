import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { usesDevInbox } from "@/adapters/email";
import { OtpForm } from "@/components/onboarding/otp-form";
import { PageSkeleton } from "@/components/page-skeleton";
import { BackButton } from "@/components/ui/back-button";
import { routes, safeReturnPath } from "@/lib/routes";
import { getMaskedPendingEmail } from "@/modules/students";
import { resendAction, verifyAction } from "../actions";

export const metadata: Metadata = { title: "Verify your email" };

export default function VerifyPage(props: PageProps<"/join/verify">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Verify {...props} />
    </Suspense>
  );
}

async function Verify({ searchParams }: PageProps<"/join/verify">) {
  const next = safeReturnPath((await searchParams).next, "");
  const maskedEmail = await getMaskedPendingEmail();
  if (!maskedEmail) redirect(routes.join(next || undefined));

  return (
    <div className="mx-auto max-w-[480px] px-6 py-8">
      <BackButton
        href={routes.join(next || undefined)}
        label="Change details"
      />
      <p className="text-eyebrow mt-6">Verify it&apos;s you</p>
      <h1 className="text-title mt-1">Check your email</h1>
      <p className="text-body mt-2">
        We sent a 6-digit code to{" "}
        <span className="text-ink font-semibold">{maskedEmail}</span>.
      </p>
      <OtpForm action={verifyAction.bind(null, next)} resend={resendAction} />
      {process.env.NODE_ENV !== "production" && usesDevInbox && (
        <p className="bg-chip text-primary mt-8 rounded-2xl px-4 py-3 text-center text-sm">
          Testing? No real email is sent yet.{" "}
          <Link
            href={routes.devInbox}
            target="_blank"
            className="font-semibold underline"
          >
            Open the dev inbox
          </Link>
        </p>
      )}
    </div>
  );
}
