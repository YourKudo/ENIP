import "server-only";

import { postgresDb } from "./postgres";

// Website-owned records (see docs/INTEGRATION.md), stored in Postgres at
// DATABASE_URL (.env.local). Any Postgres works: Neon, Supabase, local.
// Modules use this interface, never SQL, so storage can change in one place.

export type StudentRecord = {
  id: string; // our id: tracks points and referrals ("temp id")
  authUserId: string;
  name: string;
  iitId: string;
  graduationYear: number;
  email: string; // verified institute email, unique
  phone: string; // +91XXXXXXXXXX, unique
  whatsappConsent: boolean;
  whatsappConsentAt: string | null; // FR-21: when consent was given
  heardFrom: string | null; // "How did you hear about us?"
  referralCode: string;
  createdAt: string;
};

// What the student types in the sign-up form.
export type StudentDetails = Omit<
  StudentRecord,
  "id" | "authUserId" | "referralCode" | "createdAt"
>;

// Details held between the form and the OTP check (expire after 30 min).
export type PendingSignUp = {
  details: StudentDetails;
  referralCode: string | null; // code used to join, credited on verification
  expiresAt: number;
};

// Times below are epoch milliseconds.
export type OtpCodeRecord = {
  email: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
  sentAt: number[];
};

export type SessionRecord = {
  tokenHash: string;
  userId: string;
  expiresAt: number;
};

export type WaitlistRecord = {
  studentId: string;
  joinedAt: number;
  bonusPositions: number;
  admitted: boolean;
};

// One invited friend, as the referrer sees them (first name only).
export type InvitedFriend = {
  firstName: string;
  status: "pending" | "successful";
  at: number;
};

export interface Db {
  students: {
    findById(id: string): Promise<StudentRecord | null>;
    findByAuthUserId(authUserId: string): Promise<StudentRecord | null>;
    findByEmail(email: string): Promise<StudentRecord | null>;
    findByPhone(phone: string): Promise<StudentRecord | null>;
    findByReferralCode(code: string): Promise<StudentRecord | null>;
    insert(student: StudentRecord): Promise<void>;
    setAuthUserId(id: string, authUserId: string): Promise<void>;
  };
  pendingSignUps: {
    get(email: string): Promise<PendingSignUp | null>;
    put(pending: PendingSignUp): Promise<void>;
    delete(email: string): Promise<void>;
  };
  otpCodes: {
    get(email: string): Promise<OtpCodeRecord | null>;
    put(code: OtpCodeRecord): Promise<void>; // insert or replace
    addFailedAttempt(email: string): Promise<void>;
    delete(email: string): Promise<void>;
  };
  sessions: {
    get(tokenHash: string): Promise<SessionRecord | null>;
    put(session: SessionRecord): Promise<void>;
    delete(tokenHash: string): Promise<void>;
  };
  waitlist: {
    join(studentId: string): Promise<void>; // no-op if already on it
    get(studentId: string): Promise<WaitlistRecord | null>;
    // 1-based place among those still waiting; null if admitted / not on it.
    position(studentId: string): Promise<number | null>;
    waitingCount(): Promise<number>;
    setProgress(
      studentId: string,
      bonusPositions: number,
      admitted: boolean,
    ): Promise<void>;
  };
  referrals: {
    // Records a verified referral; created is false if the referee was
    // already credited to someone (a friend can be referred only once).
    addSuccessful(input: {
      referrerId: string;
      refereeId: string;
      codeUsed: string;
    }): Promise<{ id: string; created: boolean }>;
    countSuccessful(referrerId: string): Promise<number>;
    // Successful referrals plus sign-ups still waiting for their OTP.
    listInvited(referrerId: string, code: string): Promise<InvitedFriend[]>;
  };
  points: {
    // Idempotent: the same (reason, refId) is only ever counted once.
    award(input: {
      studentId: string;
      delta: number;
      reason: string;
      refId: string;
    }): Promise<void>;
    balance(studentId: string): Promise<number>;
  };
}

export const db: Db = postgresDb;
