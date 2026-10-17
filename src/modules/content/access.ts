import { POINTS_PER_REFERRAL } from "@/config/rules";
import type { Access } from "./types";

// No sign-in exists yet (Slice 2), so every visitor is anonymous and only
// free items are open. This becomes a check against the signed-in student.
export function isUnlocked(access: Access): boolean {
  return access.kind === "free";
}

export type LockMessage = { title: string; detail: string; cta: string };

// One place for every "how do I unlock this?" message, so wording stays
// consistent across guides, stats, chats and the CV review.
export function describeLock(access: Access): LockMessage {
  switch (access.kind) {
    case "free":
      return { title: "", detail: "", cta: "" };
    case "signup":
      return {
        title: "Verify your IIT email to unlock",
        detail: "Free for IIT students. Takes under a minute.",
        cta: "Verify & unlock",
      };
    case "points":
      return {
        title: `Unlock for ${access.cost} points`,
        detail: `Earn ${POINTS_PER_REFERRAL} points for every friend who joins with your link.`,
        cta: "Join & earn points",
      };
  }
}
