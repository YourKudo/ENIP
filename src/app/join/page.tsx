import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Join" };

// Placeholder until Slice 2 adds sign-up and email OTP.
export default function JoinPage() {
  return (
    <ComingSoon
      title="Sign-up"
      description="Students will enter their name, branch, IIT, email and phone, then verify their IIT email with a one-time code."
      backHref={routes.home}
    />
  );
}
