import { FileText, Lock } from "lucide-react";

import type { ChatBubble } from "@/modules/chat";

const timeFormat = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

// The viewer's own messages are plum bubbles on the right; the other side's
// are white on the left. Students view as "student", the team as "senior".
export function MessageList({
  messages,
  viewer = "student",
}: {
  messages: ChatBubble[];
  viewer?: ChatBubble["from"];
}) {
  return (
    <ol className="space-y-3">
      {messages.map((m) => {
        const mine = m.from === viewer;
        return (
          <li key={m.id} className={`flex ${mine ? "justify-end" : ""}`}>
            <div
              className={`max-w-[80%] rounded-3xl px-4 py-3 ${
                mine
                  ? "bg-primary rounded-br-md text-white"
                  : "bg-surface shadow-card text-body rounded-bl-md"
              }`}
            >
              <BubbleBody message={m} />
              <p
                className={`mt-1 text-right text-xs ${mine ? "text-white/70" : "text-muted"}`}
              >
                {timeFormat.format(new Date(m.sentAt))}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function BubbleBody({ message }: { message: ChatBubble }) {
  if (message.text === null) {
    return (
      <div className="flex items-center gap-2">
        <Lock className="text-primary size-4 shrink-0" aria-hidden />
        <div aria-hidden className="w-40 space-y-2 blur-[6px]">
          <div className="bg-locked h-3 rounded-full" />
          <div className="bg-locked h-3 w-3/4 rounded-full" />
        </div>
        <span className="sr-only">Locked reply</span>
      </div>
    );
  }
  if (message.kind === "cv") {
    return (
      <p className="flex items-center gap-2 font-medium">
        <FileText className="size-5 shrink-0" aria-hidden />
        {message.text}
      </p>
    );
  }
  return <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>;
}
