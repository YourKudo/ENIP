import "server-only";

import { cookies } from "next/headers";

import { db, type InvitedFriend } from "@/adapters/db";
import {
  CHAT_UNLOCK_REFERRALS,
  POINTS_PER_REFERRAL,
  REFERRAL_COOKIE_DAYS,
  WAITLIST_MILESTONES,
  type WaitlistMilestone,
} from "@/config/rules";
import { routes } from "@/lib/routes";
import { siteOrigin } from "@/lib/site";
import type { Student } from "@/modules/students";

// Waitlist, referrals and points (PRD 7–8). A referral counts only when the
// friend verifies their IIT email; each friend can be credited once.

const REFERRAL_COOKIE = "enip_ref";
const CODE_PATTERN = /^[A-Z0-9]{4,10}$/;

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

// Called by /r/CODE: remembers a valid code in this browser so the friend
// is credited even if they sign up days later from the plain URL.
export async function rememberReferral(rawCode: string): Promise<boolean> {
  const code = normalizeCode(rawCode);
  if (!CODE_PATTERN.test(code)) return false;
  if (!(await db.students.findByReferralCode(code))) return false;
  (await cookies()).set(REFERRAL_COOKIE, code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFERRAL_COOKIE_DAYS * 24 * 60 * 60,
  });
  return true;
}

// The remembered code and who it belongs to, for pre-filling the form.
export async function getRememberedReferral(): Promise<{
  code: string;
  referrerFirstName: string;
} | null> {
  const code = (await cookies()).get(REFERRAL_COOKIE)?.value;
  if (!code) return null;
  const referrer = await db.students.findByReferralCode(code);
  return referrer
    ? { code, referrerFirstName: referrer.name.split(" ")[0] }
    : null;
}

export async function isValidReferralCode(code: string): Promise<boolean> {
  const normalized = normalizeCode(code);
  return (
    CODE_PATTERN.test(normalized) &&
    Boolean(await db.students.findByReferralCode(normalized))
  );
}

// Runs once a new student has verified: puts them on the waitlist and, if
// they came through a friend, credits that friend.
export async function onStudentVerified(
  student: Student,
  referralCode: string | null,
): Promise<void> {
  await db.waitlist.join(student.id);
  (await cookies()).delete(REFERRAL_COOKIE);
  if (!referralCode) return;

  const referrer = await db.students.findByReferralCode(referralCode);
  // No self-referrals (FR-29); an unknown code is simply ignored.
  if (!referrer || referrer.id === student.id) return;

  const referral = await db.referrals.addSuccessful({
    referrerId: referrer.id,
    refereeId: student.id,
    codeUsed: referralCode,
  });
  if (!referral.created) return;

  await db.points.award({
    studentId: referrer.id,
    delta: POINTS_PER_REFERRAL,
    reason: "referral",
    refId: referral.id,
  });
  await recomputeWaitlist(referrer.id);
}

// Re-derives a student's waitlist bonus from their referral count, so it
// is always right even if a step above was retried.
async function recomputeWaitlist(studentId: string) {
  const successful = await db.referrals.countSuccessful(studentId);
  const { bonusPositions, admitted } = progressFor(successful);
  await db.waitlist.setProgress(studentId, bonusPositions, admitted);
}

export function progressFor(successful: number) {
  const reached = WAITLIST_MILESTONES.filter((m) => successful >= m.referrals);
  return {
    bonusPositions: Math.max(0, ...reached.map((m) => m.moveUp)),
    admitted: reached.some((m) => m.skip),
  };
}

export type GrowthSummary = {
  position: number | null; // null once admitted
  waitingCount: number;
  admitted: boolean;
  successfulReferrals: number;
  points: number;
  referralCode: string;
  referralLink: string;
  nextMilestone: (WaitlistMilestone & { remaining: number }) | null;
  invited: InvitedFriend[];
};

export async function getGrowthSummary(
  student: Student,
): Promise<GrowthSummary> {
  await db.waitlist.join(student.id); // older accounts may predate the waitlist
  const [entry, position, waitingCount, successful, points, invited, origin] =
    await Promise.all([
      db.waitlist.get(student.id),
      db.waitlist.position(student.id),
      db.waitlist.waitingCount(),
      db.referrals.countSuccessful(student.id),
      db.points.balance(student.id),
      db.referrals.listInvited(student.id, student.referralCode),
      siteOrigin(),
    ]);
  const next = WAITLIST_MILESTONES.find((m) => m.referrals > successful);

  return {
    position,
    waitingCount,
    admitted: entry?.admitted ?? false,
    successfulReferrals: successful,
    points,
    referralCode: student.referralCode,
    referralLink: `${origin}${routes.referralLink(student.referralCode)}`,
    nextMilestone: next
      ? { ...next, remaining: next.referrals - successful }
      : null,
    invited,
  };
}

// Full chat access: admitted from the waitlist, or enough referrals.
export async function hasFullChatAccess(studentId: string): Promise<boolean> {
  const [entry, successful] = await Promise.all([
    db.waitlist.get(studentId),
    db.referrals.countSuccessful(studentId),
  ]);
  return Boolean(entry?.admitted) || successful >= CHAT_UNLOCK_REFERRALS;
}
