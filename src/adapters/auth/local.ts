import {
  createHash,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

import { db } from "@/adapters/db";
import { email } from "@/adapters/email";
import type { AuthProvider } from "./index";

// Our own email-OTP sign-in. Codes and sessions are stored through the db
// adapter (Postgres when DATABASE_URL is set), hashed, never in plain text.
// The user id is the verified email itself.

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_AFTER_MS = 30 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;
const SESSION_TTL_S = 30 * 24 * 60 * 60;
const SESSION_COOKIE = "enip_session";

const sha256 = (value: string) =>
  createHash("sha256").update(value).digest("hex");

export const localAuth: AuthProvider = {
  async sendCode(address) {
    const now = Date.now();
    const previous = await db.otpCodes.get(address);
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
    await db.otpCodes.put({
      email: address,
      codeHash: sha256(code),
      expiresAt: now + CODE_TTL_MS,
      attempts: 0,
      sentAt: [...recentSends, now],
    });
    try {
      await email.send({
        to: address,
        subject: "Your ENIP verification code",
        text: `Your code is ${code}. It expires in 10 minutes.`,
      });
    } catch (error) {
      // Undo this attempt so the student can retry straight away.
      if (previous) await db.otpCodes.put(previous);
      else await db.otpCodes.delete(address);
      console.error("[email] sending the verification code failed:", error);
      return {
        ok: false,
        error: "We couldn't send the email right now. Please try again.",
      };
    }
    return { ok: true };
  },

  async verifyCode(address, code) {
    const pending = await db.otpCodes.get(address);
    if (!pending || pending.expiresAt < Date.now()) {
      return { ok: false, error: "This code has expired. Ask for a new one." };
    }
    if (pending.attempts >= MAX_ATTEMPTS) {
      return { ok: false, error: "Too many tries. Ask for a new code." };
    }
    const matches = timingSafeEqual(
      Buffer.from(sha256(code)),
      Buffer.from(pending.codeHash),
    );
    if (!matches) {
      await db.otpCodes.addFailedAttempt(address);
      return {
        ok: false,
        error: "That code isn't right. Check and try again.",
      };
    }

    await db.otpCodes.delete(address);
    const token = randomBytes(32).toString("base64url");
    await db.sessions.put({
      tokenHash: sha256(token),
      userId: address,
      expiresAt: Date.now() + SESSION_TTL_S * 1000,
    });
    (await cookies()).set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_S,
    });
    return { ok: true, userId: address };
  },

  async getUserId() {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return null;
    // Checking expiry reads the clock, so this must run per request.
    await connection();
    const session = await db.sessions.get(sha256(token));
    if (!session || session.expiresAt < Date.now()) return null;
    return session.userId;
  },

  async signOut() {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (token) await db.sessions.delete(sha256(token));
    jar.delete(SESSION_COOKIE);
  },
};
