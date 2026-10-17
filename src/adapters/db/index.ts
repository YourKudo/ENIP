import "server-only";

import { memoryDb } from "./memory";
import { postgresDb } from "./postgres";

// Website-owned records (see docs/INTEGRATION.md). With DATABASE_URL set in
// .env.local they live in Postgres; without it, in memory (dev only, reset
// on restart). Callers never know which one they use.

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
  referralCode: string;
  createdAt: string;
};

// What the student types in the sign-up form.
export type StudentDetails = Omit<
  StudentRecord,
  "id" | "authUserId" | "referralCode" | "createdAt"
>;

// Details held between the form and the OTP check (expire after 30 min).
export type PendingSignUp = { details: StudentDetails; expiresAt: number };

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
}

export const usesPostgres = Boolean(process.env.DATABASE_URL);

export const db: Db = usesPostgres ? postgresDb : memoryDb;
