import { db, type MentorRecord, type MessageRecord } from "@/adapters/db";
import type { AlumniProfile, ChatMessage, EnipApp, MemberType } from "./index";
import { rankByQuery } from "./ranking";

// Phase 1: seniors and chats live in our own Postgres (mentors,
// conversations, messages). The YAL team answers from /team. In phase 2 an
// http.ts talking to the app's API replaces this file.

const toProfile = (m: MentorRecord): AlumniProfile => ({
  ...m,
  memberType: m.memberType as MemberType,
});

const toChatMessage = (m: MessageRecord): ChatMessage => ({
  id: m.id,
  from: m.sender === "student" ? "student" : "senior",
  kind: m.kind,
  text: m.body,
  sentAt: new Date(m.createdAt).toISOString(),
});

export const localEnipApp: EnipApp = {
  async searchAlumni(query) {
    const mentors = await db.mentors.listActive();
    return rankByQuery(mentors.map(toProfile), query);
  },

  async getAlumni(id) {
    const mentor = await db.mentors.get(id);
    return mentor ? toProfile(mentor) : null;
  },

  listChatPartners: (studentId) => db.conversations.mentorIdsFor(studentId),

  async listMessages(studentId, alumniId) {
    const rows = await db.messages.listBetween(studentId, alumniId);
    return rows.map(toChatMessage);
  },

  async sendMessage(studentId, alumniId, { kind, text }) {
    const row = await db.messages.addFromStudent({
      studentId,
      mentorId: alumniId,
      kind,
      body: text,
    });
    return toChatMessage(row);
  },
};
