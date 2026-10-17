// SAMPLE DATA ONLY: made-up people for the demo, used until the app
// backend is connected.

import type { AlumniProfile, EnipApp } from "./index";

const alumni: AlumniProfile[] = [
  {
    id: "a1",
    name: "Rohan Mehta",
    institute: "IIT Kharagpur",
    branch: "CSE",
    batch: 2024,
    jobTitle: "Software Engineer",
    company: "Fintech startup",
    topics: ["SDE prep", "Resume", "Startups"],
    memberType: "alumni",
  },
  {
    id: "a2",
    name: "Ananya Iyer",
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
    name: "Kabir Shah",
    institute: "IIT Delhi",
    branch: "Mechanical",
    batch: 2022,
    jobTitle: "Founder",
    company: "EdTech startup",
    topics: ["Product", "Core to tech", "Case rounds"],
    memberType: "founder",
  },
  {
    id: "a4",
    name: "Meera Nair",
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
    name: "Priya Rao",
    institute: "IIT Roorkee",
    branch: "Electrical",
    batch: 2021,
    jobTitle: "Career mentor",
    company: "ENIP",
    topics: ["CV review", "Placement strategy"],
    memberType: "yal-team",
  },
];

export const mockEnipApp: EnipApp = {
  async listAlumni() {
    return alumni;
  },
};
