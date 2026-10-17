// SAMPLE DATA ONLY. Every name, number and story here is made up for the
// demo. This file is replaced by database queries in Slice 2.

import type { Category, ContentItem, Testimonial } from "./types";

export const categories: Category[] = [
  {
    slug: "interview-guides",
    title: "Interview guides",
    blurb: "Round-by-round prep from seniors who cleared them.",
  },
  {
    slug: "resources",
    title: "Resources",
    blurb: "Resume templates, DSA sheets and case books that worked.",
  },
  {
    slug: "placement-stories",
    title: "Placement & internship stories",
    blurb: "Honest journeys, including the rejections.",
  },
  {
    slug: "placement-stats",
    title: "Placement statistics",
    blurb: "Offers, roles and stipends by branch and sector.",
  },
];

export const contentItems: ContentItem[] = [
  {
    slug: "sde-six-week-plan",
    category: "interview-guides",
    title: "SDE interviews: the 6-week plan seniors used",
    summary: "What to practise each week, and what to skip.",
    author: { name: "Rohan Mehta", tag: "IIT Kharagpur '24 · SDE" },
    minutes: 8,
    access: { kind: "signup" },
    preview: [
      {
        type: "text",
        text: "Most of us started too late on system basics and too early on hard DP. Here is the order that worked for our batch.",
      },
      {
        type: "text",
        text: "Weeks 1–2: arrays, strings, hashing and two pointers until medium problems take under 25 minutes.",
      },
    ],
    body: [
      {
        type: "text",
        text: "Weeks 3–4: trees, graphs and the five DP patterns that cover most OA questions.",
      },
      {
        type: "text",
        text: "Week 5: mock interviews every other day. Say your approach out loud before coding.",
      },
      {
        type: "text",
        text: "Week 6: company-specific question banks and resume deep-dives.",
      },
    ],
  },
  {
    slug: "quant-probability-puzzles",
    category: "interview-guides",
    title: "Quant & trading rounds: probability puzzles to know",
    summary: "The 20 puzzles that keep coming back, with how to think out loud.",
    author: { name: "Ananya Iyer", tag: "IIT Bombay '23 · Quant Researcher" },
    minutes: 12,
    access: { kind: "points", cost: 20 },
    preview: [
      {
        type: "text",
        text: "Interviewers care less about the final number and more about how you set up the problem. Start every answer by naming the sample space.",
      },
    ],
    body: [
      { type: "text", text: "Puzzle 1: expected tosses to get two heads in a row." },
      { type: "text", text: "Puzzle 2: the broken stick and the triangle." },
      { type: "text", text: "Puzzle 3: optimal stopping with a die." },
    ],
  },
  {
    slug: "pm-case-rounds",
    category: "interview-guides",
    title: "Product management case rounds, explained",
    summary: "A simple structure for product design and metrics questions.",
    author: { name: "Kabir Shah", tag: "IIT Delhi '22 · Product Manager" },
    minutes: 6,
    access: { kind: "free" },
    preview: [
      {
        type: "text",
        text: "Clarify the user, list their pain points, pick one, then design for it. Most candidates jump straight to features.",
      },
    ],
    body: [
      {
        type: "text",
        text: "For metrics questions, start from the goal of the product, then the user action that shows it is working.",
      },
      {
        type: "text",
        text: "End every answer with one trade-off you would watch after launch.",
      },
    ],
  },
  {
    slug: "resume-template-2025",
    category: "resources",
    title: "One-page resume template used by placed seniors",
    summary: "The format, the bullet style, and common mistakes.",
    author: { name: "ENIP team", tag: "Compiled from 40 placed resumes" },
    minutes: 4,
    access: { kind: "signup" },
    preview: [
      {
        type: "text",
        text: "Every bullet should start with a verb and end with a number. If you cannot measure it, say what changed because of your work.",
      },
    ],
    body: [
      { type: "text", text: "Section order that recruiters scan fastest." },
      { type: "text", text: "Download link for the template." },
    ],
  },
  {
    slug: "dsa-topic-sheet",
    category: "resources",
    title: "Topic-wise DSA sheet (180 problems)",
    summary: "Grouped by pattern, with the must-do ones marked.",
    author: { name: "Rohan Mehta", tag: "IIT Kharagpur '24 · SDE" },
    minutes: 3,
    access: { kind: "points", cost: 10 },
    preview: [
      {
        type: "text",
        text: "Do the starred problems first. They cover most patterns asked in online assessments.",
      },
    ],
    body: [
      { type: "text", text: "Arrays & hashing: 25 problems." },
      { type: "text", text: "Graphs: 30 problems." },
    ],
  },
  {
    slug: "low-cgpa-to-product",
    category: "placement-stories",
    title: "From a 6.8 CGPA to a product role",
    summary: "How projects and referrals made up for the shortlist cut-offs.",
    author: { name: "Ishaan Verma", tag: "IIT Roorkee '24 · Associate PM" },
    minutes: 7,
    access: { kind: "signup" },
    preview: [
      {
        type: "text",
        text: "I was filtered out of most Day-1 shortlists. What got me interviews was two shipped side projects and a senior who referred me.",
      },
    ],
    body: [
      { type: "text", text: "How I picked projects that interviewers asked about." },
      { type: "text", text: "How I asked for referrals without being awkward." },
    ],
  },
  {
    slug: "civil-to-software",
    category: "placement-stories",
    title: "Switching from civil to software",
    summary: "A non-circuit branch story, including what I would skip.",
    author: { name: "Meera Nair", tag: "IIT Madras '23 · Software Engineer" },
    minutes: 5,
    access: { kind: "free" },
    preview: [
      {
        type: "text",
        text: "I started coding seriously in third year. It is late, but not too late if you are consistent.",
      },
    ],
    body: [
      {
        type: "text",
        text: "I did one problem a day for 200 days and one internship-style project per semester.",
      },
    ],
  },
  {
    slug: "placements-2026-snapshot",
    category: "placement-stats",
    title: "Placement season snapshot (sample)",
    summary: "Median offers and top recruiting sectors across branches.",
    author: { name: "ENIP team", tag: "Sample numbers for the demo" },
    minutes: 3,
    access: { kind: "signup" },
    preview: [
      { type: "stat", label: "Students placed", value: "84%" },
      { type: "stat", label: "Top sector", value: "Software" },
    ],
    body: [
      { type: "stat", label: "Median CTC (CSE)", value: "₹24 LPA" },
      { type: "stat", label: "Median CTC (core)", value: "₹14 LPA" },
      { type: "stat", label: "Day-1 offers", value: "312" },
      { type: "stat", label: "PPOs", value: "190" },
    ],
  },
  {
    slug: "internship-stipends",
    category: "placement-stats",
    title: "Internship stipends by sector (sample)",
    summary: "What second- and third-years were offered last summer.",
    author: { name: "ENIP team", tag: "Sample numbers for the demo" },
    minutes: 2,
    access: { kind: "points", cost: 15 },
    preview: [{ type: "stat", label: "Sectors covered", value: "9" }],
    body: [
      { type: "stat", label: "Quant / trading", value: "₹1.5L / month" },
      { type: "stat", label: "Software", value: "₹1L / month" },
      { type: "stat", label: "Consulting", value: "₹60K / month" },
    ],
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "A senior reviewed my resume in a day. Two of their edits came up in my interview.",
    name: "Aditi",
    tag: "IIT Guwahati, 4th year",
  },
  {
    quote:
      "I finally understood what quant interviews look for, from someone who did one last year.",
    name: "Pranav",
    tag: "IIT Kanpur, 3rd year",
  },
  {
    quote: "Referred three friends and skipped the waitlist the same evening.",
    name: "Sneha",
    tag: "IIT BHU, 3rd year",
  },
];

export const platformStats = [
  { label: "IIT alumni", value: "1,200+" },
  { label: "IITs", value: "23" },
  { label: "Companies", value: "300+" },
];
