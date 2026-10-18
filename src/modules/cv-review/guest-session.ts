import "server-only";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";

export const GUEST_CV_REVIEW_COOKIE = "enip_cv_review_guest";

export async function readGuestCvReviewToken() {
  const token = (await cookies()).get(GUEST_CV_REVIEW_COOKIE)?.value;
  return token && /^[A-Za-z0-9_-]{40,50}$/.test(token) ? token : null;
}

export function hashGuestCvReviewToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
