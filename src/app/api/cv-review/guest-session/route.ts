import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

import { db } from "@/adapters/db";
import { getCurrentStudent } from "@/modules/students";
import {
  GUEST_CV_REVIEW_COOKIE,
  hashGuestCvReviewToken,
  readGuestCvReviewToken,
} from "@/modules/cv-review/guest-session";

export async function GET() {
  if (await getCurrentStudent()) {
    return NextResponse.json({ ok: true });
  }

  let token = await readGuestCvReviewToken();
  const isNew = !token;
  token ??= randomBytes(32).toString("base64url");
  await db.cvReviews.ensureGuestClaim(hashGuestCvReviewToken(token));

  const response = NextResponse.json({ ok: true });
  response.headers.set("Cache-Control", "no-store");
  if (isNew) {
    response.cookies.set(GUEST_CV_REVIEW_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 90 * 24 * 60 * 60,
    });
  }
  return response;
}
