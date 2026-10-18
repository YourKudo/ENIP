import "server-only";

import { z } from "zod";

import { auth } from "@/adapters/auth";
import { db, type MessageRecord } from "@/adapters/db";
import { findIit } from "@/config/iits";
import {
  clearPendingEmail,
  getPendingEmail,
  maskEmail,
  setPendingEmail,
} from "@/lib/pending-email";
import { checkMessageText, type ChatBubble } from "@/modules/chat";
import { hasFullChatAccess } from "@/modules/growth";

// Phase 1 team inbox: YAL team members sign in at /team and answer students
// as the senior profiles (mentors table). Who is on the team is the
// TEAM_EMAILS list in .env (comma-separated). In phase 2 seniors reply from
// the app and this module is no longer needed.

const PENDING_COOKIE = "enip_team_pending_email";
const PENDING_TTL_S = 15 * 60;

export type TeamResult = { ok: true } | { ok: false; error: string };

export type InboxItem = {
  conversationId: string;
  studentName: string;
  iitName: string;
  seniorName: string;
  preview: string;
  lastAt: number;
  messageCount: number;
  needsReply: boolean; // the student wrote last
};

export type Thread = {
  student: {
    name: string;
    iitName: string;
    graduationYear: number;
    heardFrom: string | null;
  };
  seniorName: string;
  // Replies after the free one stay blurred for the student until they
  // refer a friend; the team sees everything.
  studentHasFullAccess: boolean;
  messages: (ChatBubble & { sentBy: string | null })[];
};

const emailField = z.string().trim().toLowerCase().pipe(z.email());

function teamEmails(): string[] {
  return (process.env.TEAM_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

// The signed-in team member's email, or null. With local auth the user id
// is the verified email itself.
export async function getTeamMember(): Promise<string | null> {
  const userId = await auth.getUserId();
  return userId && teamEmails().includes(userId) ? userId : null;
}

export async function startTeamSignIn(form: FormData): Promise<TeamResult> {
  const parsed = emailField.safeParse(form.get("email") ?? "");
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (!teamEmails().includes(parsed.data)) {
    return { ok: false, error: "This email isn't on the team list." };
  }
  const sent = await auth.sendCode(parsed.data);
  if (!sent.ok) return sent;
  await setPendingEmail(PENDING_COOKIE, parsed.data, PENDING_TTL_S);
  return { ok: true };
}

export async function resendTeamCode(): Promise<TeamResult> {
  const email = await getPendingEmail(PENDING_COOKIE);
  if (!email) return { ok: false, error: "Start again." };
  return auth.sendCode(email);
}

export async function completeTeamSignIn(code: string): Promise<TeamResult> {
  const email = await getPendingEmail(PENDING_COOKIE);
  if (!email) return { ok: false, error: "Your session expired. Start again." };
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, error: "Enter the 6-digit code." };
  }
  const verified = await auth.verifyCode(email, code);
  if (!verified.ok) return verified;
  await clearPendingEmail(PENDING_COOKIE);
  return { ok: true };
}

export async function getMaskedTeamPendingEmail() {
  const email = await getPendingEmail(PENDING_COOKIE);
  return email ? maskEmail(email) : null;
}

// Waiting-for-a-reply first, then the most recent.
export async function listInbox(): Promise<InboxItem[]> {
  const rows = await db.conversations.listInbox();
  return rows
    .map((r) => ({
      conversationId: r.conversationId,
      studentName: r.studentName,
      iitName: findIit(r.studentIitId)?.name ?? r.studentIitId,
      seniorName: r.mentorName,
      preview: previewOf(r.lastMessage),
      lastAt: r.lastMessage.createdAt,
      messageCount: r.messageCount,
      needsReply: r.lastMessage.sender === "student",
    }))
    .sort((a, b) => Number(b.needsReply) - Number(a.needsReply));
}

export async function getThread(
  conversationId: string,
): Promise<Thread | null> {
  const conversation = await db.conversations.get(conversationId);
  if (!conversation) return null;
  const [student, mentor, messages, fullAccess] = await Promise.all([
    db.students.findById(conversation.studentId),
    db.mentors.get(conversation.mentorId),
    db.messages.list(conversation.id),
    hasFullChatAccess(conversation.studentId),
  ]);
  if (!student) return null;
  return {
    student: {
      name: student.name,
      iitName: findIit(student.iitId)?.name ?? student.iitId,
      graduationYear: student.graduationYear,
      heardFrom: student.heardFrom,
    },
    seniorName: mentor?.displayName ?? "Senior (inactive)",
    studentHasFullAccess: fullAccess,
    messages: messages.map((m) => ({
      id: m.id,
      from: m.sender === "student" ? "student" : "senior",
      kind: m.kind,
      text: m.body,
      sentAt: new Date(m.createdAt).toISOString(),
      sentBy: m.sentBy,
    })),
  };
}

export async function sendTeamReply(
  teamMember: string,
  conversationId: string,
  rawText: string,
): Promise<TeamResult> {
  const text = rawText.trim();
  const invalid = checkMessageText(text);
  if (invalid) return { ok: false, error: invalid };
  if (!(await db.conversations.get(conversationId))) {
    return { ok: false, error: "This conversation no longer exists." };
  }
  await db.messages.addFromMentor({
    conversationId,
    body: text,
    sentBy: teamMember,
  });
  return { ok: true };
}

function previewOf(m: Pick<MessageRecord, "sender" | "kind" | "body">) {
  const who = m.sender === "student" ? "" : "You: ";
  return m.kind === "cv" ? `${who}Sent a CV: ${m.body}` : `${who}${m.body}`;
}
