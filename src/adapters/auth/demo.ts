import { connection } from "next/server";

import type { AuthProvider, Student } from "./index";

// DEMO ONLY: everyone is signed in as this sample student, so logged-in
// screens can be designed before real sign-up exists (Slice 2).
const demoStudent: Student = {
  id: "demo-student",
  name: "Demo Student",
  email: "demo@iitb.ac.in",
  institute: "IIT Bombay",
  branch: "CSE",
  emailVerified: true,
};

export const demoAuth: AuthProvider = {
  async getCurrentStudent() {
    // Real providers read the session cookie, which makes the page render
    // per request. connection() gives the demo the same behaviour.
    await connection();
    return demoStudent;
  },
};
