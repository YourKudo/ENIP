import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonClasses } from "@/components/button-link";
import { AutoRefresh } from "@/components/chat/auto-refresh";
import { PageSkeleton } from "@/components/page-skeleton";
import { routes } from "@/lib/routes";
import { getTeamMember, listInbox } from "@/modules/team";
import { teamSignOutAction } from "./actions";

export const metadata: Metadata = { title: "Team inbox" };

const timeFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

export default function TeamInboxPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TeamInbox />
    </Suspense>
  );
}

async function TeamInbox() {
  const member = await getTeamMember();
  if (!member) redirect(routes.teamSignIn);

  const inbox = await listInbox();
  const waiting = inbox.filter((c) => c.needsReply).length;

  return (
    <div className="mx-auto max-w-[640px] px-6 py-8">
      <AutoRefresh everyMs={10000} />
      <p className="text-eyebrow">YAL team</p>
      <h1 className="text-title mt-1">Team inbox</h1>
      <p className="text-body mt-2">
        {waiting === 0
          ? "All caught up."
          : `${waiting} ${waiting === 1 ? "student is" : "students are"} waiting for a reply.`}
      </p>

      {inbox.length === 0 ? (
        <div className="card mt-6 text-center">
          <p className="text-card-title">No chats yet</p>
          <p className="text-meta mt-1">
            Messages students send to the senior profiles show up here.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {inbox.map((c) => (
            <li key={c.conversationId}>
              <Link
                href={routes.teamChat(c.conversationId)}
                className="card flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-ink min-w-0 truncate font-bold">
                    {c.studentName}
                    <span className="text-muted font-normal">
                      {" "}
                      to {c.seniorName}
                    </span>
                  </p>
                  {c.needsReply && (
                    <span className="bg-primary shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white">
                      Needs reply
                    </span>
                  )}
                </div>
                <p className="text-body truncate">{c.preview}</p>
                <p className="text-meta">
                  {c.iitName} · {c.messageCount}{" "}
                  {c.messageCount === 1 ? "message" : "messages"} ·{" "}
                  {timeFormat.format(new Date(c.lastAt))}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="text-meta mt-10 flex items-center justify-between gap-3">
        <span className="min-w-0 truncate">Signed in as {member}</span>
        <form action={teamSignOutAction}>
          <button type="submit" className={buttonClasses("secondary")}>
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
