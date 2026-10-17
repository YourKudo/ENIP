import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/join/actions";
import { ButtonLink, buttonClasses } from "@/components/button-link";
import { PageSkeleton } from "@/components/page-skeleton";
import { routes } from "@/lib/routes";
import { getCurrentStudent } from "@/modules/students";

export const metadata: Metadata = { title: "Waitlist" };

// Placeholder: the full waitlist screen (position, referral progress,
// points) comes next. It already shows the student's referral code.
export default function WaitlistPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Waitlist />
    </Suspense>
  );
}

async function Waitlist() {
  const student = await getCurrentStudent();
  if (!student) redirect(routes.join());

  return (
    <div className="mx-auto max-w-[480px] px-6 py-10">
      <p className="text-eyebrow">You&apos;re in</p>
      <h1 className="text-title mt-1">Welcome, {student.name.split(" ")[0]}</h1>
      <p className="text-body mt-2">
        Your IIT email is verified. Your waitlist position and referral progress
        will show here next.
      </p>

      <div className="card mt-6 text-center">
        <p className="text-meta">Your referral code</p>
        <p className="text-primary mt-1 font-mono text-3xl font-bold tracking-widest">
          {student.referralCode}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <ButtonLink href={routes.search()} fullWidth>
          Find someone to talk to
        </ButtonLink>
        <form action={signOutAction}>
          <button type="submit" className={buttonClasses("secondary", true)}>
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
