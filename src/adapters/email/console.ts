import type { EmailSender } from "./index";

// DEV ONLY: prints emails in the dev server terminal instead of sending
// them, so OTP codes can be read there. Refuses to run in production.
export const consoleEmail: EmailSender = {
  async send({ to, subject, text }) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "EMAIL_PROVIDER=console cannot send real email. Configure a provider.",
      );
    }
    console.log(`\n[email] to: ${to}\n[email] ${subject}\n[email] ${text}\n`);
  },
};
