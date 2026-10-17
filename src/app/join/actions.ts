"use server";

import { redirect } from "next/navigation";

import { routes, safeReturnPath } from "@/lib/routes";
import {
  completeVerification,
  resendCode,
  signOut,
  startSignIn,
  startSignUp,
  type FieldErrors,
} from "@/modules/students";

// What a form shows after a failed submit: errors plus what was typed, so
// nothing has to be re-entered.
export type FormState = {
  fieldErrors: FieldErrors;
  formError?: string;
  values: Record<string, string>;
} | null;

export async function signUpAction(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const result = await startSignUp(form);
  if (!result.ok) return { ...result, values: typedValues(form) };
  redirect(routes.verify(nextFrom(form)));
}

export async function signInAction(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const result = await startSignIn(form);
  if (!result.ok) return { ...result, values: typedValues(form) };
  redirect(routes.verify(nextFrom(form)));
}

// No `next` means Path A ("Join the network"): land on the waitlist.
export async function verifyAction(
  next: string,
  _previous: { error: string } | null,
  form: FormData,
): Promise<{ error: string } | null> {
  const result = await completeVerification(String(form.get("code") ?? ""));
  if (!result.ok) return { error: result.error };
  redirect(safeReturnPath(next, routes.waitlist));
}

export async function resendAction(): Promise<{
  ok: boolean;
  message: string;
}> {
  const result = await resendCode();
  return result.ok
    ? { ok: true, message: "New code sent." }
    : { ok: false, message: result.error };
}

export async function signOutAction() {
  await signOut();
  redirect(routes.home);
}

function nextFrom(form: FormData) {
  return safeReturnPath(form.get("next"), "") || undefined;
}

function typedValues(form: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of form) {
    // Skip "next" and React's internal "$ACTION…" fields.
    if (typeof value === "string" && key !== "next" && !key.startsWith("$")) {
      values[key] = value;
    }
  }
  return values;
}
