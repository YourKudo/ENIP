import type { Metadata } from "next";

import { ButtonLink } from "@/components/button-link";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Join" };

// Placeholder until Slice 2 adds sign-up and email OTP.
export default function JoinPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <h1 className="text-title">Sign-up is coming next</h1>
      <p className="text-body mt-2">
        This is where students will enter their name, branch, IIT, email and
        phone, then verify their IIT email with a one-time code.
      </p>
      <div className="mt-6">
        <ButtonLink href={routes.home} variant="secondary">
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}
