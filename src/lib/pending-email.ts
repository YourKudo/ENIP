import "server-only";

import { cookies } from "next/headers";

// The email waiting for its one-time code, kept in an httpOnly cookie
// (never in the URL) between the email form and the code screen.
// Each sign-in flow (students, team) uses its own cookie name.

export async function setPendingEmail(
  cookie: string,
  email: string,
  maxAgeSeconds: number,
) {
  (await cookies()).set(cookie, email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function getPendingEmail(cookie: string) {
  return (await cookies()).get(cookie)?.value ?? null;
}

export async function clearPendingEmail(cookie: string) {
  (await cookies()).delete(cookie);
}

// "a••••••@iitb.ac.in": shown on the code screen without exposing the address.
export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  return `${local[0]}${"•".repeat(Math.max(local.length - 1, 3))}@${domain}`;
}
