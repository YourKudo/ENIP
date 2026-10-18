import "server-only";

import { localEnipApp } from "./local";

// Everything the website needs from the ENIP app's backend. Phase 1 (local.ts)
// keeps seniors and chats in our own database. The app dev team's API plugs
// in as a second implementation of this interface (http.ts) in phase 2.

// FR-18: YAL team members and EIRs get their own badge and are never
// labelled as alumni.
export type MemberType = "alumni" | "founder" | "yal-team" | "eir";

export type AlumniProfile = {
  id: string;
  // The app decides what to show: the real name or the member's chosen
  // username, per their privacy setting. The website just displays it.
  displayName: string;
  // Profile photo or the avatar the member picked in the app; null = none.
  avatarUrl: string | null;
  institute: string;
  branch: string;
  batch: number;
  jobTitle: string;
  company: string;
  // One line on how they can help, written by the member in the app.
  helpWith: string;
  topics: string[];
  memberType: MemberType;
};

// The student writes from the web; the senior replies from /team (phase 1)
// or from the app (phase 2).
export type ChatMessage = {
  id: string;
  from: "student" | "senior";
  kind: "text" | "cv"; // for "cv", text is the file name
  text: string;
  sentAt: string; // ISO timestamp
};

export type NewMessage = Pick<ChatMessage, "kind" | "text">;

export interface EnipApp {
  // Ranked by relevance to a free-text intent ("someone to review my CV").
  // Empty query = everyone. The app's own AI matching powers the real one.
  searchAlumni(query: string): Promise<AlumniProfile[]>;
  getAlumni(id: string): Promise<AlumniProfile | null>;
  // Alumni the student already has a conversation with.
  listChatPartners(studentId: string): Promise<string[]>;
  listMessages(studentId: string, alumniId: string): Promise<ChatMessage[]>;
  sendMessage(
    studentId: string,
    alumniId: string,
    message: NewMessage,
  ): Promise<ChatMessage>;
}

export const enipApp: EnipApp = localEnipApp;
