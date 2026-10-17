import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Refer friends" };

// Placeholder until Slice 3 adds referral links, codes and tracking.
export default function ReferralsPage() {
  return (
    <ComingSoon
      title="Refer friends"
      description="Share your link or code. Each friend who verifies their IIT email moves you up the waitlist and earns you points."
      backHref={routes.search()}
    />
  );
}
