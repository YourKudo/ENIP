import "server-only";

import type { Student } from "@/adapters/auth";
import {
  enipApp,
  type ChatMessage,
  type NewMessage,
} from "@/adapters/enip-app";
import {
  FREE_CHAT_MESSAGES,
  FREE_CONVERSATIONS,
  FREE_VISIBLE_REPLIES,
} from "@/config/rules";

// Website-side chat rules (PRD 6.3). Messages themselves live in the app's
// backend; this module decides what the student may send and see.

// A message as the browser receives it: text is null when the reply is
// locked, so blurred replies can't be read with dev tools.
export type ChatBubble = Omit<ChatMessage, "text"> & { text: string | null };

// Why the student can't send right now, or null if they can.
export type BlockedReason = "conversation-limit" | "message-limit" | null;

export type ChatView = {
  messages: ChatBubble[];
  freeMessagesLeft: number;
  lockedReplyCount: number;
  blockedReason: BlockedReason;
};

export type SendResult = { ok: true } | { ok: false; error: string };

const MAX_MESSAGE_LENGTH = 1000;

const blockedMessages: Record<NonNullable<BlockedReason>, string> = {
  "conversation-limit": "You've used your free chat with another senior.",
  "message-limit": "You've used your free messages.",
};

export function describeBlocked(reason: NonNullable<BlockedReason>) {
  return blockedMessages[reason];
}

// Referrals and points unlock full chat in Slice 3; until then nobody has it.
function hasFullChatAccess(): boolean {
  return false;
}

export async function getChatView(
  student: Student,
  alumniId: string,
): Promise<ChatView> {
  const [messages, partners] = await Promise.all([
    enipApp.listMessages(student.id, alumniId),
    enipApp.listChatPartners(student.id),
  ]);
  const fullAccess = hasFullChatAccess();

  let repliesSeen = 0;
  let lockedReplyCount = 0;
  const bubbles = messages.map((m): ChatBubble => {
    if (m.from !== "senior" || fullAccess) return m;
    repliesSeen += 1;
    if (repliesSeen <= FREE_VISIBLE_REPLIES) return m;
    lockedReplyCount += 1;
    return { ...m, text: null };
  });

  const freeMessagesLeft = Math.max(
    0,
    FREE_CHAT_MESSAGES - countSent(messages),
  );
  const isNewConversation = !partners.includes(alumniId);

  let blockedReason: BlockedReason = null;
  if (!fullAccess) {
    if (isNewConversation && partners.length >= FREE_CONVERSATIONS) {
      blockedReason = "conversation-limit";
    } else if (freeMessagesLeft === 0) {
      blockedReason = "message-limit";
    }
  }

  return {
    messages: bubbles,
    freeMessagesLeft,
    lockedReplyCount,
    blockedReason,
  };
}

export async function sendStudentMessage(
  student: Student,
  alumniId: string,
  message: NewMessage,
): Promise<SendResult> {
  const text = message.text.trim();
  if (!text) return { ok: false, error: "Type a message first." };
  if (text.length > MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      error: `Keep it under ${MAX_MESSAGE_LENGTH} characters.`,
    };
  }
  if (!(await enipApp.getAlumni(alumniId))) {
    return { ok: false, error: "This senior is no longer available." };
  }

  // Checked again here, not just in the UI, so the limits can't be bypassed.
  const { blockedReason } = await getChatView(student, alumniId);
  if (blockedReason) {
    return { ok: false, error: describeBlocked(blockedReason) };
  }

  await enipApp.sendMessage(student.id, alumniId, { kind: message.kind, text });
  return { ok: true };
}

function countSent(messages: ChatMessage[]) {
  return messages.filter((m) => m.from === "student").length;
}
