import "server-only";

import { devInboxEmail } from "./dev-inbox";
import { smtpEmail } from "./smtp";

// Outgoing email (OTP codes for now). EMAIL_PROVIDER in .env.local picks the
// implementation: "smtp" sends real email, anything else uses the dev inbox.

export type EmailMessage = { to: string; subject: string; text: string };

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

export const usesDevInbox = process.env.EMAIL_PROVIDER !== "smtp";

export const email: EmailSender = usesDevInbox ? devInboxEmail : smtpEmail;

export { readDevInbox, type DevInboxEmail } from "./dev-inbox";
