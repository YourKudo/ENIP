// SAMPLE DATA ONLY: made-up people and canned replies for the demo, used
// until the app backend is connected. Chats are kept in memory, so they
// reset when the dev server restarts.

import type { AlumniProfile, ChatMessage, EnipApp } from "./index";

const alumni: AlumniProfile[] = [
  {
    id: "a1",
    displayName: "Rohan Mehta",
    avatarUrl: null,
    institute: "IIT Kharagpur",
    branch: "CSE",
    batch: 2024,
    jobTitle: "Software Engineer",
    company: "Fintech startup",
    topics: ["SDE prep", "Resume", "Startups", "System design"],
    memberType: "alumni",
  },
  {
    id: "a2",
    displayName: "@probability_nerd",
    avatarUrl: null,
    institute: "IIT Bombay",
    branch: "Mathematics",
    batch: 2023,
    jobTitle: "Quant Researcher",
    company: "Trading firm",
    topics: ["Quant", "Probability", "Internships"],
    memberType: "alumni",
  },
  {
    id: "a3",
    displayName: "Kabir Shah",
    avatarUrl: null,
    institute: "IIT Delhi",
    branch: "Mechanical",
    batch: 2022,
    jobTitle: "Founder",
    company: "EdTech startup",
    topics: ["Product", "Core to tech", "Case rounds", "Fundraising", "Growth"],
    memberType: "founder",
  },
  {
    id: "a4",
    displayName: "@civil2code",
    avatarUrl: null,
    institute: "IIT Madras",
    branch: "Civil",
    batch: 2023,
    jobTitle: "Software Engineer",
    company: "SaaS company",
    topics: ["Branch switch", "DSA", "Projects"],
    memberType: "alumni",
  },
  {
    id: "t1",
    displayName: "Priya Rao",
    avatarUrl: null,
    institute: "IIT Roorkee",
    branch: "Electrical",
    batch: 2021,
    jobTitle: "Career mentor",
    company: "ENIP",
    topics: ["CV review", "Placement strategy"],
    memberType: "yal-team",
  },
];

const cannedReplies = [
  "Hey! Happy to help. Tell me a bit about your branch and the roles you're targeting.",
  "Good question. Most of my batch started prep about six months before placements: DSA basics first, then one solid project.",
  "Mock interviews made the biggest difference for me. Try to do two a week with friends.",
];
const cvReply =
  "Thanks for sharing your CV. Two quick things: add numbers to your project bullets, and move skills below projects.";
const REPLY_DELAY_MS = 3000;

// Kept on globalThis so chats survive the dev server's hot reloads.
const chats: Map<string, ChatMessage[]> = ((
  globalThis as { __enipMockChats?: Map<string, ChatMessage[]> }
).__enipMockChats ??= new Map());

export const mockEnipApp: EnipApp = {
  async listAlumni() {
    return alumni;
  },

  async getAlumni(id) {
    return alumni.find((a) => a.id === id) ?? null;
  },

  // Replies are stored with a future timestamp and only show up once that
  // time has passed, which mimics a senior answering from the app.
  async listMessages(studentId, alumniId) {
    const now = new Date().toISOString();
    return (chats.get(`${studentId}:${alumniId}`) ?? []).filter(
      (m) => m.sentAt <= now,
    );
  },

  async sendMessage(studentId, alumniId, message) {
    const key = `${studentId}:${alumniId}`;
    const thread = chats.get(key) ?? [];
    const now = Date.now();
    const sent: ChatMessage = {
      id: crypto.randomUUID(),
      from: "student",
      ...message,
      sentAt: new Date(now).toISOString(),
    };
    const repliesSoFar = thread.filter((m) => m.from === "senior").length;
    const reply: ChatMessage = {
      id: crypto.randomUUID(),
      from: "senior",
      kind: "text",
      text:
        message.kind === "cv"
          ? cvReply
          : cannedReplies[repliesSoFar % cannedReplies.length],
      sentAt: new Date(now + REPLY_DELAY_MS).toISOString(),
    };
    chats.set(key, [...thread, sent, reply]);
    return sent;
  },
};
