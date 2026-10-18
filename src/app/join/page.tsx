import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { JoinForm } from "@/components/onboarding/join-form";
import { PageSkeleton } from "@/components/page-skeleton";
import { iits } from "@/config/iits";
import { HEARD_FROM_OPTIONS } from "@/config/sources";
import { routes, safeReturnPath } from "@/lib/routes";
import { getRememberedReferral } from "@/modules/growth";
import { getCurrentStudent, graduationYears } from "@/modules/students";
import { signUpAction } from "./actions";

export const metadata: Metadata = { title: "Join" };

// One form for both onboarding paths. `next` decides where the student
// lands after verifying: back to the chat (Path B) or the waitlist (Path A).
export default function JoinPage(props: PageProps<"/join">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Join {...props} />
    </Suspense>
  );
}

async function Join({ searchParams }: PageProps<"/join">) {
  const next = safeReturnPath((await searchParams).next, "");
  if (await getCurrentStudent()) redirect(next || routes.waitlist);

  // The graduation years depend on today's date, so build them per request.
  await connection();
  const toChat = next.startsWith("/chat/");
  const invitedBy = await getRememberedReferral();

  return (
    <div className="join-page mx-auto max-w-[480px] px-5 py-8 sm:px-6 sm:py-10">
      <p className="join-eyebrow">
        {toChat ? "One step before you chat" : "Join the network"}
      </p>
      <h1 className="join-title mt-2">
        {toChat ? "Tell us who you are" : "Get on the waitlist"}
      </h1>
      <p className="join-description mt-3">
        {toChat
          ? "Seniors only talk to verified IITians. This takes under a minute."
          : "Verify your IIT email to join. Refer friends to move up the list."}
      </p>

      {invitedBy && (
        <p className="join-invite mt-5 rounded-2xl px-4 py-3 text-sm font-semibold">
          {invitedBy.referrerFirstName} invited you. Their code {invitedBy.code}{" "}
          is filled in below.
        </p>
      )}

      <JoinForm
        action={signUpAction}
        iits={iits.map(({ id, name, domains }) => ({
          id,
          name,
          domain: domains[0],
        }))}
        years={graduationYears()}
        sources={HEARD_FROM_OPTIONS}
        rememberedCode={invitedBy?.code ?? null}
        next={next}
      />

      <p className="join-signin mt-6 text-center">
        Already joined?{" "}
        <Link
          href={routes.signIn(next || undefined)}
          className="text-primary font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
