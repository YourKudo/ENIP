import "server-only";

import { mockEnipApp } from "./mock";

// Everything the website needs from the ENIP app's backend. The app dev team's
// API plugs in as a second implementation of this interface (http.ts), and
// ENIP_APP_PROVIDER in .env picks which one is used.

export type AlumniProfile = {
  id: string;
  name: string;
  institute: string;
  branch: string;
  batch: number;
  role: string;
  company: string;
  topics: string[];
  // FR-18: ENIP team mentors must be labelled, never shown as alumni.
  isEnipTeam: boolean;
};

export interface EnipApp {
  listAlumni(): Promise<AlumniProfile[]>;
}

export const enipApp: EnipApp = mockEnipApp;
