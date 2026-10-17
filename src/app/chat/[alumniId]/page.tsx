import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Lock } from "lucide-react";

import { auth } from "@/adapters/auth";
import { enipApp } from "@/adapters/enip-app";
import { ButtonLink } from "@/components/button-link";
import { AutoRefresh } from "@/components/chat/auto-refresh";
import { Composer } from "@/components/chat/composer";
import { MessageList } from "@/components/chat/message-list";
import { PageSkeleton } from "@/components/page-skeleton";
import { BackButton } from "@/components/ui/back-button";
import { MemberBadge } from "@/components/ui/badge";
import {
  CHAT_UNLOCK_POINTS,
  CHAT_UNLOCK_REFERRALS,
  FREE_CHAT_MESSAGES,
} from "@/config/rules";
import { routes } from "@/lib/routes";
import { getChatView } from "@/modules/chat";
import { sendMessageAction } from "./actions";

export const metadata: Metadata = { title: "Chat" };

const starters = [
  "How did you prepare for placements?",
  "Can you review my CV?",
  "What's the work like day to day?",
];

// The chat depends on who is signed in, so it renders per request inside
// Suspense; the skeleton shows instantly meanwhile.
export default function ChatPage({ params }: PageProps<"/chat/[alumniId]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ChatScreen params={params} />
    </Suspense>
  );
}

async function ChatScreen({
  params,
}: Pick<PageProps<"/chat/[alumniId]">, "params">) {
  const { alumniId } = await params;
  const student = await auth.getCurrentStudent();
  if (!student) redirect(routes.join(routes.chat(alumniId)));

  const senior = await enipApp.getAlumni(alumniId);
  if (!senior) notFound();

  const chat = await getChatView(student, alumniId);
  const isEmpty = chat.messages.length === 0;
  const showUnlock = chat.lockedReplyCount > 0 || !chat.canSend;

  return (
    <div className="mx-auto flex max-w-[480px] flex-col gap-5 px-6 py-6">
      <AutoRefresh everyMs={4000} />

      <header className="grid grid-cols-[56px_1fr_56px] items-center gap-2">
        <BackButton href={routes.alumni} label="Back to alumni" />
        <div className="flex min-w-0 flex-col items-center gap-1 text-center">
          <h1 className="text-ink w-full truncate text-[22px] font-bold">
            {senior.displayName}
          </h1>
          <MemberBadge type={senior.memberType} />
        </div>
      </header>

      <p className="bg-chip text-primary self-center rounded-full px-4 py-1.5 text-sm font-semibold">
        {chat.freeMessagesLeft} of {FREE_CHAT_MESSAGES} free messages left
      </p>

      {isEmpty ? (
        <div className="card text-center">
          <p className="text-card-title">Say hi to {senior.displayName}</p>
          <p className="text-meta mt-1">
            {senior.jobTitle} @ {senior.company}. Your first{" "}
            {FREE_CHAT_MESSAGES} messages are free.
          </p>
        </div>
      ) : (
        <MessageList messages={chat.messages} />
      )}

      {showUnlock && (
        <div className="card border-line-strong border text-center">
          <span className="bg-primary-dark mx-auto flex size-12 items-center justify-center rounded-full text-white">
            <Lock className="size-5" aria-hidden />
          </span>
          <p className="text-ink mt-3 font-bold">
            Refer {CHAT_UNLOCK_REFERRALS} friend or use {CHAT_UNLOCK_POINTS}{" "}
            points to keep chatting
          </p>
          <p className="text-meta mt-1">
            {chat.lockedReplyCount > 0
              ? `${chat.lockedReplyCount} more ${chat.lockedReplyCount === 1 ? "reply is" : "replies are"} waiting for you.`
              : "You've used your free messages."}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <ButtonLink href={routes.referrals} fullWidth>
              Refer a friend
            </ButtonLink>
            <ButtonLink href={routes.rewards} variant="secondary" fullWidth>
              Use {CHAT_UNLOCK_POINTS} points
            </ButtonLink>
          </div>
        </div>
      )}

      <Composer
        action={sendMessageAction.bind(null, alumniId)}
        disabled={!chat.canSend}
        suggestions={isEmpty ? starters : []}
      />
    </div>
  );
}
