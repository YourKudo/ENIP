"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import type { FormState } from "@/app/join/actions";
import { routes } from "@/lib/routes";
import type { SendResult } from "@/modules/chat";
import { signOut } from "@/modules/students";
import {
  completeTeamSignIn,
  getTeamMember,
  resendTeamCode,
  sendTeamReply,
  startTeamSignIn,
} from "@/modules/team";

export async function teamSignInAction(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const result = await startTeamSignIn(form);
  if (!result.ok) {
    return {
      fieldErrors: { email: result.error },
      values: { email: String(form.get("email") ?? "") },
    };
  }
  redirect(routes.teamVerify);
}

export async function teamVerifyAction(
  _previous: { error: string } | null,
  form: FormData,
): Promise<{ error: string } | null> {
  const result = await completeTeamSignIn(String(form.get("code") ?? ""));
  if (!result.ok) return { error: result.error };
  redirect(routes.team);
}

export async function teamResendAction() {
  const result = await resendTeamCode();
  return result.ok
    ? { ok: true, message: "New code sent." }
    : { ok: false, message: result.error };
}

export async function teamReplyAction(
  conversationId: string,
  _previous: SendResult | null,
  form: FormData,
): Promise<SendResult> {
  const member = await getTeamMember();
  if (!member) return { ok: false, error: "Please sign in again." };
  const result = await sendTeamReply(
    member,
    conversationId,
    String(form.get("text") ?? ""),
  );
  if (result.ok) refresh();
  return result;
}

export async function teamSignOutAction() {
  await signOut();
  redirect(routes.teamSignIn);
}
