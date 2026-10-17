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
    company: "Microsoft",
    helpWith:
      "SDE interview prep, DSA plans and resume reviews for tech roles.",
    topics: ["Get Hired", "SDE prep", "Resume Review", "System design"],
    memberType: "alumni",
  },
  {
    id: "a2",
    displayName: "IIT Bombay Alum",
    avatarUrl: null,
    institute: "IIT Bombay",
    branch: "Mathematics",
    batch: 2023,
    jobTitle: "Quant Researcher",
    company: "Trading firm",
    helpWith: "Quant and trading internships: probability rounds and puzzles.",
    topics: ["Quant", "Internships", "Probability"],
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
    helpWith: "Startup ideas, fundraising, and I'm hiring interns for growth.",
    topics: ["Hiring", "Fundraising", "Startups", "Growth", "Internships"],
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
    company: "Google",
    helpWith: "Switching from a non-CS branch to software, projects and DSA.",
    topics: ["Branch switch", "DSA", "Career Guidance"],
    memberType: "alumni",
  },
  {
    id: "a5",
    displayName: "IIT Kanpur Alum",
    avatarUrl: null,
    institute: "IIT Kanpur",
    branch: "Economics",
    batch: 2020,
    jobTitle: "Associate",
    company: "Goldman Sachs",
    helpWith:
      "Finance placements, IB interviews and resume reviews for finance.",
    topics: ["Finance", "Get Hired", "Resume Review"],
    memberType: "alumni",
  },
  {
    id: "a6",
    displayName: "@vc_notes",
    avatarUrl: null,
    institute: "IIT Bombay",
    branch: "Chemical",
    batch: 2019,
    jobTitle: "Investment Analyst",
    company: "Venture capital fund",
    helpWith: "Breaking into venture capital and VC internships.",
    topics: ["VC", "Internships", "Fundraising"],
    memberType: "alumni",
  },
  {
    id: "a7",
    displayName: "Ishaan Verma",
    avatarUrl: null,
    institute: "IIT Roorkee",
    branch: "Electrical",
    batch: 2024,
    jobTitle: "Associate Product Manager",
    company: "Consumer tech",
    helpWith: "Product management interviews, case rounds and APM prep.",
    topics: ["Product", "Case rounds", "Get Hired"],
    memberType: "alumni",
  },
  {
    id: "a8",
    displayName: "IIT Kharagpur Alum",
    avatarUrl: null,
    institute: "IIT Kharagpur",
    branch: "Industrial Engg",
    batch: 2021,
    jobTitle: "Talent Lead",
    company: "SaaS startup",
    helpWith:
      "We're hiring software engineers and interns. Ask about openings.",
    topics: ["Hiring", "Software engineers", "Internships"],
    memberType: "founder",
  },
  {
    id: "t1",
    displayName: "Priya Rao",
    avatarUrl: null,
    institute: "IIT Roorkee",
    branch: "Electrical",
    batch: 2021,
    jobTitle: "Career mentor",
    company: "YAL",
    helpWith: "CV reviews, placement strategy and career guidance.",
    topics: ["Resume Review", "Career Guidance", "Placements"],
    memberType: "yal-team",
  },
  {
    id: "t2",
    displayName: "@campus_listener",
    avatarUrl: null,
    institute: "IIT Delhi",
    branch: "Design",
    batch: 2020,
    jobTitle: "Entrepreneur in Residence",
    company: "YAL",
    helpWith: "Campus life, stress and the occasional rant. No judgement.",
    topics: ["Campus Life", "Rants", "Peer Discussions"],
    memberType: "eir",
  },
];

// Simple keyword relevance so the demo ranks sensibly. Not meant to be
// smart: the real ranking comes from the app's backend.
const synonyms: Record<string, string> = {
  cv: "resume",
  pm: "product",
  apm: "product",
  vc: "venture",
  rant: "rants",
  intern: "internships",
  internship: "internships",
  job: "hiring",
  jobs: "hiring",
  hire: "hiring",
  swe: "software",
  sde: "software",
  startup: "startups",
  college: "campus",
  placement: "placements",
};
const stopWords = new Set(
  "a an and the i me my to for in of on with who can someone need want help about find is are be just some iit alumni alum".split(
    " ",
  ),
);

function keywords(query: string) {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !stopWords.has(w))
    .map((w) => synonyms[w] ?? w);
}

function relevance(person: AlumniProfile, words: string[]) {
  const fields: [string, number][] = [
    [person.topics.join(" "), 3],
    [`${person.helpWith} ${person.jobTitle} ${person.company}`, 2],
    [`${person.institute} ${person.branch} ${person.memberType}`, 1],
  ];
  return words.reduce(
    (score, word) =>
      score +
      fields.reduce(
        (s, [text, weight]) =>
          s + (text.toLowerCase().includes(word) ? weight : 0),
        0,
      ),
    0,
  );
}

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

const chatKey = (studentId: string, alumniId: string) =>
  `${studentId}:${alumniId}`;

export const mockEnipApp: EnipApp = {
  async searchAlumni(query) {
    const words = keywords(query);
    if (words.length === 0) return alumni;
    return alumni
      .map((person) => ({ person, score: relevance(person, words) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.person);
  },

  async getAlumni(id) {
    return alumni.find((a) => a.id === id) ?? null;
  },

  async listChatPartners(studentId) {
    return [...chats.keys()]
      .filter((key) => key.startsWith(`${studentId}:`))
      .map((key) => key.slice(studentId.length + 1));
  },

  // Replies are stored with a future timestamp and only show up once that
  // time has passed, which mimics a senior answering from the app.
  async listMessages(studentId, alumniId) {
    const now = new Date().toISOString();
    return (chats.get(chatKey(studentId, alumniId)) ?? []).filter(
      (m) => m.sentAt <= now,
    );
  },

  async sendMessage(studentId, alumniId, message) {
    const key = chatKey(studentId, alumniId);
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
