import "server-only";

import { devInboxEmail } from "./dev-inbox";

// Outgoing email (OTP codes for now). A real provider such as Resend or
// AWS SES plugs in as another file here; EMAIL_PROVIDER picks it.

export type EmailMessage = { to: string; subject: string; text: string };

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

export const email: EmailSender = devInboxEmail;

export { readDevInbox, type DevInboxEmail } from "./dev-inbox";
