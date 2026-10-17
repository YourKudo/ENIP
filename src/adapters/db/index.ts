import "server-only";

import { memoryDb } from "./memory";

// Website-owned records. In memory for now; a Postgres implementation
// (Drizzle) replaces memory.ts without changing callers. Once the app
// backend is connected, students are also created there (one record per
// verified institute email, FR-09).

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
}

export const db: Db = memoryDb;
