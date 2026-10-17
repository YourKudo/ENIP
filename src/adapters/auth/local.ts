import {
  createHash,
  randomBytes,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

import { email } from "@/adapters/email";
import type { AuthProvider } from "./index";

// Our own email-OTP sign-in. State is kept in memory for now (it resets
// when the server restarts); it moves to the database with Slice 3.

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_AFTER_MS = 30 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;
const SESSION_TTL_S = 30 * 24 * 60 * 60;
const SESSION_COOKIE = "enip_session";

type PendingCode = {
  hash: string;
  expiresAt: number;
  attempts: number;
  sentAt: number[];
};
type Session = { userId: string; expiresAt: number };

type AuthState = {
  codes: Map<string, PendingCode>;
  sessions: Map<string, Session>; // keyed by hash of the cookie token
  users: Map<string, string>; // email -> user id
};

// Kept on globalThis so state survives the dev server's hot reloads.
const state: AuthState = ((
  globalThis as { __enipAuth?: AuthState }
).__enipAuth ??= {
  codes: new Map(),
  sessions: new Map(),
  users: new Map(),
});

const sha256 = (value: string) =>
  createHash("sha256").update(value).digest("hex");

export const localAuth: AuthProvider = {
  async sendCode(address) {
    const now = Date.now();
    const previous = state.codes.get(address);
    const recentSends = (previous?.sentAt ?? []).filter(
      (t) => now - t < 60 * 60 * 1000,
    );
    const lastSent = recentSends.at(-1) ?? 0;
    if (now - lastSent < RESEND_AFTER_MS) {
      const wait = Math.ceil((RESEND_AFTER_MS - (now - lastSent)) / 1000);
      return {
        ok: false,
        error: `Wait ${wait}s before asking for a new code.`,
      };
    }
    if (recentSends.length >= MAX_SENDS_PER_HOUR) {
      return { ok: false, error: "Too many codes requested. Try again later." };
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    state.codes.set(address, {
      hash: sha256(code),
      expiresAt: now + CODE_TTL_MS,
      attempts: 0,
      sentAt: [...recentSends, now],
    });
    await email.send({
      to: address,
      subject: "Your ENIP verification code",
      text: `Your code is ${code}. It expires in 10 minutes.`,
    });
    return { ok: true };
  },

  async verifyCode(address, code) {
    const pending = state.codes.get(address);
    if (!pending || pending.expiresAt < Date.now()) {
      return { ok: false, error: "This code has expired. Ask for a new one." };
    }
    if (pending.attempts >= MAX_ATTEMPTS) {
      return { ok: false, error: "Too many tries. Ask for a new code." };
    }
    const matches = timingSafeEqual(
      Buffer.from(sha256(code)),
      Buffer.from(pending.hash),
    );
    if (!matches) {
      pending.attempts += 1;
      return {
        ok: false,
        error: "That code isn't right. Check and try again.",
      };
    }

    state.codes.delete(address);
    let userId = state.users.get(address);
    if (!userId) {
      userId = randomUUID();
      state.users.set(address, userId);
    }

    const token = randomBytes(32).toString("base64url");
    state.sessions.set(sha256(token), {
      userId,
      expiresAt: Date.now() + SESSION_TTL_S * 1000,
    });
    (await cookies()).set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_S,
    });
    return { ok: true, userId };
  },

  async getUserId() {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return null;
    // Checking expiry reads the clock, so this must run per request.
    await connection();
    const session = state.sessions.get(sha256(token));
    if (!session || session.expiresAt < Date.now()) return null;
    return session.userId;
  },

  async signOut() {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (token) state.sessions.delete(sha256(token));
    jar.delete(SESSION_COOKIE);
  },
};
