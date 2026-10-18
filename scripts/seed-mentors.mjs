// Adds the starter senior profiles to the mentors table, if it's empty.
//   npm run db:seed
// SAMPLE PROFILES: edit or replace them with the real YAL team members (in
// Drizzle Studio: npm run db:studio) before real students see the site.

import postgres from "postgres";

const profiles = [
  {
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

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("DATABASE_URL is missing. Run with --env-file=.env.local");
  process.exit(1);
}
const sql = postgres(url, { max: 1, prepare: false });

try {
  const [{ n }] = await sql`select count(*)::int as n from mentors`;
  if (n > 0) {
    console.log(`Skipped: the mentors table already has ${n} profiles.`);
  } else {
    for (const p of profiles) {
      await sql`
        insert into mentors (display_name, avatar_url, institute, branch, batch,
          job_title, company, help_with, topics, member_type)
        values (${p.displayName}, ${p.avatarUrl}, ${p.institute}, ${p.branch},
          ${p.batch}, ${p.jobTitle}, ${p.company}, ${p.helpWith},
          ${p.topics}, ${p.memberType})`;
    }
    console.log(`Added ${profiles.length} sample profiles.`);
  }
} finally {
  await sql.end();
}
