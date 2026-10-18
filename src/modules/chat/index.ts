import "server-only";

import {
  enipApp,
  type ChatMessage,
  type NewMessage,
} from "@/adapters/enip-app";
import {
  FREE_CHAT_MESSAGES,
  FREE_CONVERSATIONS,
  FREE_VISIBLE_REPLIES,
  MAX_MESSAGE_LENGTH,
} from "@/config/rules";
import { hasFullChatAccess } from "@/modules/growth";
import type { Student } from "@/modules/students";

// Website-side chat rules (PRD 6.3). Messages are stored by the enip-app
// adapter; this module decides what the student may send and see.

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

const blockedMessages: Record<NonNullable<BlockedReason>, string> = {
  "conversation-limit": "You've used your free chat with another senior.",
  "message-limit": "You've used your free messages.",
};

export function describeBlocked(reason: NonNullable<BlockedReason>) {
  return blockedMessages[reason];
}

export async function getChatView(
  student: Student,
  alumniId: string,
): Promise<ChatView> {
  // A referral (or skipping the waitlist) removes the free-chat limits.
  const [messages, partners, fullAccess] = await Promise.all([
    enipApp.listMessages(student.id, alumniId),
    enipApp.listChatPartners(student.id),
    hasFullChatAccess(student.id),
  ]);

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
  const invalid = checkMessageText(text);
  if (invalid) return { ok: false, error: invalid };
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

// Shared with the team inbox. Returns an error message, or null if fine.
export function checkMessageText(text: string): string | null {
  if (!text) return "Type a message first.";
  if (text.length > MAX_MESSAGE_LENGTH) {
    return `Keep it under ${MAX_MESSAGE_LENGTH} characters.`;
  }
  return null;
}

function countSent(messages: ChatMessage[]) {
  return messages.filter((m) => m.from === "student").length;
}
