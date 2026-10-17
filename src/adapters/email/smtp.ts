import nodemailer, { type Transporter } from "nodemailer";

import type { EmailSender } from "./index";

// Real email over SMTP. Works with any SMTP server (Brevo now, the company
// server later): only the SMTP_* values in .env.local change.

let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  if (!transporter) {
    const port = Number(required("SMTP_PORT"));
    transporter = nodemailer.createTransport({
      host: required("SMTP_HOST"),
      port,
      secure: port === 465, // 587 upgrades to TLS via STARTTLS
      auth: { user: required("SMTP_USER"), pass: required("SMTP_PASS") },
    });
  }
  return transporter;
}

export const smtpEmail: EmailSender = {
  async send({ to, subject, text }) {
    await getTransporter().sendMail({
      from: required("SMTP_FROM"),
      to,
      subject,
      text,
    });
  },
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing in .env.local`);
  return value;
}
