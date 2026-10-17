import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Inbox } from "lucide-react";

import { readDevInbox } from "@/adapters/email";
import { AutoRefresh } from "@/components/chat/auto-refresh";
import { PageSkeleton } from "@/components/page-skeleton";

export const metadata: Metadata = {
  title: "Dev inbox",
  robots: { index: false },
};

const timeFormat = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "Asia/Kolkata",
});

// DEV ONLY: shows the emails the site "sent" (OTP codes) so sign-up can be
// tested without a real email provider. Missing in production.
export default function DevInboxPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DevInbox />
    </Suspense>
  );
}

async function DevInbox() {
  await connection();
  const emails = readDevInbox();

  return (
    <div className="mx-auto max-w-[480px] px-6 py-10">
      <AutoRefresh everyMs={3000} />
      <p className="text-eyebrow">Testing only</p>
      <h1 className="text-title mt-1">Dev inbox</h1>
      <p className="text-body mt-2">
        No real emails are sent yet. Codes appear here (and in the dev server
        terminal). It resets when the server restarts.
      </p>

      {emails.length === 0 ? (
        <div className="card mt-6 text-center">
          <Inbox className="text-primary mx-auto size-8" aria-hidden />
          <p className="text-card-title mt-2">No emails yet</p>
          <p className="text-meta mt-1">
            Sign up or sign in, and the code shows up here.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {emails.map((mail) => {
            const code = mail.text.match(/\b\d{6}\b/)?.[0];
            return (
              <li key={mail.id} className="card">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-ink truncate font-semibold">{mail.to}</p>
                  <p className="text-meta shrink-0">
                    {timeFormat.format(new Date(mail.sentAt))}
                  </p>
                </div>
                <p className="text-meta">{mail.subject}</p>
                {code && (
                  <p className="text-primary mt-2 font-mono text-3xl font-bold tracking-widest">
                    {code}
                  </p>
                )}
                <p className="text-body mt-1 text-sm">{mail.text}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
