import "server-only";

import { localAuth } from "./local";

// Identity only: proving someone owns an email (one-time code) and keeping
// them signed in (session). Who the student is (name, IIT, referral code)
// lives in modules/students. Supabase Auth, Better Auth or similar can
// replace local.ts by implementing this interface; AUTH_PROVIDER picks it.

export type AuthResult<T = object> =
  ({ ok: true } & T) | { ok: false; error: string };

export interface AuthProvider {
  // Emails a one-time code. Rate-limited per email.
  sendCode(email: string): Promise<AuthResult>;
  // Checks the code and, if right, starts a signed-in session.
  verifyCode(
    email: string,
    code: string,
  ): Promise<AuthResult<{ userId: string }>>;
  // The signed-in user's id for this request, or null.
  getUserId(): Promise<string | null>;
  signOut(): Promise<void>;
}

export const auth: AuthProvider = localAuth;
