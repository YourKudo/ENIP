import type { EmailMessage, EmailSender } from "./index";

// DEV ONLY: instead of sending, keeps the last emails in memory so they can
// be read at /dev/inbox (handy on a phone), and prints them in the dev
// server terminal. Refuses to run in production.

export type DevInboxEmail = EmailMessage & { id: string; sentAt: string };

const MAX_KEPT = 50;

// Kept on globalThis so emails survive the dev server's hot reloads.
const inbox: DevInboxEmail[] = ((
  globalThis as { __enipDevInbox?: DevInboxEmail[] }
).__enipDevInbox ??= []);

export const devInboxEmail: EmailSender = {
  async send(message) {
    assertNotProduction();
    inbox.unshift({
      ...message,
      id: crypto.randomUUID(),
      sentAt: new Date().toISOString(),
    });
    inbox.length = Math.min(inbox.length, MAX_KEPT);
    console.log(
      `\n[email] to: ${message.to}\n[email] ${message.subject}\n[email] ${message.text}\n`,
    );
  },
};

// Newest first.
export function readDevInbox(): DevInboxEmail[] {
  assertNotProduction();
  return [...inbox];
}

function assertNotProduction() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "EMAIL_PROVIDER=dev-inbox cannot send real email. Configure a provider.",
    );
  }
}
