import "server-only";

import { demoAuth } from "./demo";

// Sign-in is behind this interface so the provider can be chosen later
// (Supabase Auth, Better Auth, or our own OTP code) by adding one file next
// to demo.ts and switching AUTH_PROVIDER. Pages and modules only ever call
// `auth.*`, never a provider's SDK. sendOtp / verifyOtp arrive in Slice 2.

export type Student = {
  id: string;
  name: string;
  email: string;
  institute: string;
  branch: string;
  emailVerified: boolean;
};

export interface AuthProvider {
  // The signed-in student for this request, or null if signed out.
  getCurrentStudent(): Promise<Student | null>;
}

export const auth: AuthProvider = demoAuth;
