import "server-only";

import { randomInt, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";

import { auth } from "@/adapters/auth";
import { db, type StudentRecord } from "@/adapters/db";
import { emailBelongsTo, findIit } from "@/config/iits";
import { isHeardFrom } from "@/config/sources";
import {
  isValidReferralCode,
  normalizeCode,
  onStudentVerified,
} from "@/modules/growth";

// Sign-up and sign-in rules (PRD 6.2). Both onboarding paths use these:
// "Join the network" lands on the waitlist, "Try it" returns to the chat.
// Anti-abuse: the email must be a verified address of the chosen IIT, and
// one account per email and per phone number.

export type Student = StudentRecord;

export type FieldErrors = Partial<
  Record<
    | "name"
    | "iitId"
    | "graduationYear"
    | "email"
    | "phone"
    | "heardFrom"
    | "referralCode",
    string
  >
>;

export type StartResult =
  | { ok: true; email: string }
  | { ok: false; fieldErrors: FieldErrors; formError?: string };

const PENDING_TTL_MS = 30 * 60 * 1000;
const PENDING_COOKIE = "enip_pending_email";

export function graduationYears(): number[] {
  const thisYear = new Date().getFullYear();
  return Array.from({ length: 7 }, (_, i) => thisYear - 1 + i);
}

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address."));

const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(60, "Keep your name under 60 characters."),
  iitId: z.string().refine((id) => findIit(id), "Pick your IIT."),
  graduationYear: z.coerce
    .number()
    .refine((y) => graduationYears().includes(y), "Pick your graduation year."),
  email: emailField,
  phone: z
    .string()
    .transform((p) =>
      p.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, ""),
    )
    .refine(
      (p) => /^[6-9]\d{9}$/.test(p),
      "Enter a 10-digit Indian mobile number.",
    )
    .transform((p) => `+91${p}`),
  whatsappConsent: z.literal("on").optional(),
  heardFrom: z
    .string()
    .refine(isHeardFrom, "Tell us how you heard about ENIP."),
  referralCode: z.string().transform(normalizeCode).optional(),
});

export async function getCurrentStudent(): Promise<Student | null> {
  const userId = await auth.getUserId();
  return userId ? db.students.findByAuthUserId(userId) : null;
}

export async function startSignUp(form: FormData): Promise<StartResult> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return { ok: false, fieldErrors: firstErrors(parsed.error) };
  }
  const input = parsed.data;

  const iit = findIit(input.iitId)!;
  if (!emailBelongsTo(iit, input.email)) {
    return {
      ok: false,
      fieldErrors: {
        email: `Use your ${iit.name} email (ending in @${iit.domains[0]}).`,
      },
    };
  }
  if (await db.students.findByEmail(input.email)) {
    return {
      ok: false,
      fieldErrors: {
        email: "This email is already registered. Sign in instead.",
      },
    };
  }
  if (await db.students.findByPhone(input.phone)) {
    return {
      ok: false,
      fieldErrors: {
        phone: "This number is already linked to another account.",
      },
    };
  }
  const referralCode = input.referralCode || null;
  if (referralCode && !(await isValidReferralCode(referralCode))) {
    return {
      ok: false,
      fieldErrors: {
        referralCode: "We couldn't find this code. Check it or leave it empty.",
      },
    };
  }

  const consent = input.whatsappConsent === "on";
  await db.pendingSignUps.put({
    details: {
      name: input.name,
      iitId: input.iitId,
      graduationYear: input.graduationYear,
      email: input.email,
      phone: input.phone,
      whatsappConsent: consent,
      whatsappConsentAt: consent ? new Date().toISOString() : null,
      heardFrom: input.heardFrom,
    },
    referralCode,
    expiresAt: Date.now() + PENDING_TTL_MS,
  });
  return sendCodeTo(input.email);
}

export async function startSignIn(form: FormData): Promise<StartResult> {
  const parsed = emailField.safeParse(form.get("email") ?? "");
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: { email: "Enter a valid email address." },
    };
  }
  if (!(await db.students.findByEmail(parsed.data))) {
    return {
      ok: false,
      fieldErrors: { email: "No account with this email yet. Join first." },
    };
  }
  return sendCodeTo(parsed.data);
}

export async function resendCode() {
  const pendingEmail = await getPendingEmail();
  if (!pendingEmail) return { ok: false as const, error: "Start again." };
  return auth.sendCode(pendingEmail);
}

// Checks the code, then signs in an existing student or creates the new
// one from the details they entered.
export async function completeVerification(
  code: string,
): Promise<{ ok: true; student: Student } | { ok: false; error: string }> {
  const email = await getPendingEmail();
  if (!email) return { ok: false, error: "Your session expired. Start again." };
  if (!/^\d{6}$/.test(code))
    return { ok: false, error: "Enter the 6-digit code." };

  const verified = await auth.verifyCode(email, code);
  if (!verified.ok) return verified;

  let student = await db.students.findByEmail(email);
  if (student) {
    if (student.authUserId !== verified.userId) {
      await db.students.setAuthUserId(student.id, verified.userId);
    }
  } else {
    const pending = await db.pendingSignUps.get(email);
    if (!pending) {
      return {
        ok: false,
        error: "Your sign-up expired. Please fill the form again.",
      };
    }
    student = {
      ...pending.details,
      id: randomUUID(),
      authUserId: verified.userId,
      referralCode: await newReferralCode(pending.details.name),
      createdAt: new Date().toISOString(),
    };
    await db.students.insert(student);
    await db.pendingSignUps.delete(email);
    await onStudentVerified(student, pending.referralCode);
  }

  (await cookies()).delete(PENDING_COOKIE);
  return { ok: true, student };
}

export async function signOut() {
  await auth.signOut();
}

// "a••••••@iitb.ac.in": shown on the OTP screen without exposing the address.
export async function getMaskedPendingEmail(): Promise<string | null> {
  const email = await getPendingEmail();
  if (!email) return null;
  const [local, domain] = email.split("@");
  return `${local[0]}${"•".repeat(Math.max(local.length - 1, 3))}@${domain}`;
}

async function sendCodeTo(email: string): Promise<StartResult> {
  const sent = await auth.sendCode(email);
  if (!sent.ok) return { ok: false, fieldErrors: {}, formError: sent.error };
  // The email waits in an httpOnly cookie, never in the URL.
  (await cookies()).set(PENDING_COOKIE, email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_TTL_MS / 1000,
  });
  return { ok: true, email };
}

async function getPendingEmail() {
  return (await cookies()).get(PENDING_COOKIE)?.value ?? null;
}

// Easy to say and remember: first 4 letters of the first name + 2 random
// digits, e.g. "ROHA47". Random digits (not phone digits) so the code
// reveals nothing; a third digit is added if the name is very common.
async function newReferralCode(name: string): Promise<string> {
  const letters = (name.split(" ")[0] ?? "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .padEnd(4, "X")
    .slice(0, 4);
  for (let attempt = 0; ; attempt++) {
    const digits = attempt < 20 ? 2 : 3;
    const code = `${letters}${randomInt(10 ** (digits - 1), 10 ** digits)}`;
    if (!(await db.students.findByReferralCode(code))) return code;
  }
}

function firstErrors(error: z.ZodError): FieldErrors {
  const { fieldErrors } = z.flattenError(error);
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([field, messages]) => [
      field,
      (messages as string[])[0],
    ]),
  );
}
