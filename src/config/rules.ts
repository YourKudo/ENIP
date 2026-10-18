// Product rules from the PRD. Product can change these numbers without
// touching any other file.

export const POINTS_PER_REFERRAL = 10;

// CV review economics are intentionally unset until product finalizes them.
// Empty or invalid values disable paid reviews instead of making them free.
function optionalPositiveInteger(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export const INITIAL_POINTS = optionalPositiveInteger(
  process.env.ENIP_INITIAL_POINTS,
);
export const INSTANT_CV_REVIEW_COST = optionalPositiveInteger(
  process.env.ENIP_INSTANT_CV_REVIEW_COST,
);

// Waitlist (PRD 7.3): successful referrals needed for each milestone, how
// many places it moves the student up, and the one that skips the line.
export type WaitlistMilestone = {
  referrals: number;
  moveUp: number;
  skip?: boolean;
};
export const WAITLIST_MILESTONES: WaitlistMilestone[] = [
  { referrals: 1, moveUp: 3 },
  { referrals: 2, moveUp: 7 },
  { referrals: 3, moveUp: 0, skip: true },
];

// How long a referral link is remembered in the friend's browser, so they
// are still credited if they come back later by typing the plain URL.
export const REFERRAL_COOKIE_DAYS = 30;

// Free alumni chat (PRD 6.3): how many seniors a student can start a free
// chat with, messages they can send in each, and how many senior replies
// they can read before the rest are blurred.
export const FREE_CONVERSATIONS = 1;
export const FREE_CHAT_MESSAGES = 3;
export const FREE_VISIBLE_REPLIES = 1;

// Ways to keep chatting once the free allowance is used.
export const CHAT_UNLOCK_REFERRALS = 1;
export const CHAT_UNLOCK_POINTS = 30;

// Longest chat message, for students and team replies alike.
export const MAX_MESSAGE_LENGTH = 1000;
