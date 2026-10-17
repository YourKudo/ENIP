import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Points & rewards" };

// Placeholder until Slice 3 adds the points ledger and unlocks.
export default function RewardsPage() {
  return (
    <ComingSoon
      title="Points & rewards"
      description="See your points balance and spend points to unlock resources, placement stats and more chats."
      backHref={routes.search()}
    />
  );
}
