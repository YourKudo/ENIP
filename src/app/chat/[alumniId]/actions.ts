"use server";

import { refresh } from "next/cache";

import { sendStudentMessage, type SendResult } from "@/modules/chat";
import { getCurrentStudent } from "@/modules/students";

export async function sendMessageAction(
  alumniId: string,
  _previous: SendResult | null,
  form: FormData,
): Promise<SendResult> {
  const student = await getCurrentStudent();
  if (!student) return { ok: false, error: "Please sign in to chat." };

  const result = await sendStudentMessage(student, alumniId, {
    kind: form.get("kind") === "cv" ? "cv" : "text",
    text: String(form.get("text") ?? ""),
  });
  if (result.ok) refresh();
  return result;
}
