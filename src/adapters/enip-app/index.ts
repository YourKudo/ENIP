import "server-only";

import { mockEnipApp } from "./mock";

// Everything the website needs from the ENIP app's backend. The app dev team's
// API plugs in as a second implementation of this interface (http.ts), and
// ENIP_APP_PROVIDER in .env picks which one is used.

// FR-18: YAL team members and EIRs get their own badge and are never
// labelled as alumni.
export type MemberType = "alumni" | "founder" | "yal-team" | "eir";

export type AlumniProfile = {
  id: string;
  name: string;
  institute: string;
  branch: string;
  batch: number;
  jobTitle: string;
  company: string;
  topics: string[];
  memberType: MemberType;
};

export interface EnipApp {
  listAlumni(): Promise<AlumniProfile[]>;
}

export const enipApp: EnipApp = mockEnipApp;
