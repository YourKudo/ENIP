import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/onboarding/sign-in-form";
import { PageSkeleton } from "@/components/page-skeleton";
import { routes } from "@/lib/routes";
import { getTeamMember } from "@/modules/team";
import { teamSignInAction } from "../actions";

export const metadata: Metadata = { title: "Team sign in" };

export default function TeamSignInPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TeamSignIn />
    </Suspense>
  );
}

async function TeamSignIn() {
  if (await getTeamMember()) redirect(routes.team);

  return (
    <div className="mx-auto max-w-[480px] px-6 py-10">
      <p className="text-eyebrow">YAL team</p>
      <h1 className="text-title mt-1">Team inbox</h1>
      <p className="text-body mt-2">
        Reply to students as the senior profiles. Only emails on the team list
        can sign in.
      </p>
      <SignInForm
        action={teamSignInAction}
        next=""
        label="Team email"
        placeholder="you@yal.in"
      />
    </div>
  );
}
