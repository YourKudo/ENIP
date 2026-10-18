import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";

import { AutoRefresh } from "@/components/chat/auto-refresh";
import { Composer } from "@/components/chat/composer";
import { MessageList } from "@/components/chat/message-list";
import { PageSkeleton } from "@/components/page-skeleton";
import { BackButton } from "@/components/ui/back-button";
import { FREE_VISIBLE_REPLIES } from "@/config/rules";
import { HEARD_FROM_OPTIONS } from "@/config/sources";
import { routes } from "@/lib/routes";
import { getTeamMember, getThread } from "@/modules/team";
import { teamReplyAction } from "../../actions";

export const metadata: Metadata = { title: "Team chat" };

export default function TeamChatPage(
  props: PageProps<"/team/chat/[conversationId]">,
) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TeamChat {...props} />
    </Suspense>
  );
}

async function TeamChat({ params }: PageProps<"/team/chat/[conversationId]">) {
  if (!(await getTeamMember())) redirect(routes.teamSignIn);

  const { conversationId } = await params;
  const thread = await getThread(conversationId);
  if (!thread) notFound();

  const { student } = thread;
  const heardFrom = HEARD_FROM_OPTIONS.find(
    (o) => o.id === student.heardFrom,
  )?.label;

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-5 px-6 py-6">
      <AutoRefresh everyMs={5000} />

      <header className="flex items-center gap-4">
        <BackButton href={routes.team} label="Back to inbox" />
        <div className="min-w-0">
          <h1 className="text-ink truncate text-[22px] font-bold">
            {student.name}
          </h1>
          <p className="text-meta">
            {student.iitName} · class of {student.graduationYear}
            {heardFrom && ` · heard via: ${heardFrom}`}
          </p>
        </div>
      </header>

      <p className="bg-chip text-primary self-center rounded-full px-4 py-1.5 text-center text-sm font-semibold">
        You&apos;re replying as {thread.seniorName}
      </p>
      {!thread.studentHasFullAccess && (
        <p className="text-meta text-center">
          Free plan: the student can read your first {FREE_VISIBLE_REPLIES}{" "}
          {FREE_VISIBLE_REPLIES === 1 ? "reply" : "replies"}. Later ones stay
          blurred until they refer a friend.
        </p>
      )}

      <MessageList messages={thread.messages} viewer="senior" />

      <Composer
        action={teamReplyAction.bind(null, conversationId)}
        canAttachCv={false}
        placeholder={`Reply as ${thread.seniorName}…`}
      />
    </div>
  );
}
