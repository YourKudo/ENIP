import { Coins, Lock, LockOpen } from "lucide-react";

import { routes } from "@/lib/routes";
import { describeLock, type Access } from "@/modules/content";
import { ButtonLink } from "./button-link";
import { Badge } from "./ui/badge";

// Small label for cards: "Free", "Sign up", or "20 pts".
export function AccessBadge({ access }: { access: Access }) {
  switch (access.kind) {
    case "free":
      return (
        <Badge tone="alumni" icon={LockOpen}>
          Free
        </Badge>
      );
    case "signup":
      return (
        <Badge tone="primary" icon={Lock}>
          Sign up
        </Badge>
      );
    case "points":
      return (
        <Badge tone="founder" icon={Coins}>
          {access.cost} pts
        </Badge>
      );
  }
}

// Blurred bars standing in for hidden content, plus the unlock CTA. It
// draws placeholders, not the real text, because the real text is never
// sent to the browser.
export function BlurLock({
  access,
  hiddenCount,
  returnTo,
}: {
  access: Access;
  hiddenCount: number;
  returnTo: string;
}) {
  const lock = describeLock(access);
  return (
    <div className="card relative mt-6 min-h-72 overflow-hidden">
      <div aria-hidden className="space-y-3 blur-[6px]">
        {Array.from({ length: Math.max(hiddenCount, 2) * 2 }, (_, i) => (
          <div
            key={i}
            className="bg-locked h-4 rounded-full"
            style={{ width: `${90 - ((i * 17) % 35)}%` }}
          />
        ))}
      </div>
      <div className="bg-surface/50 absolute inset-0 flex flex-col items-center justify-center p-5 text-center">
        <span className="bg-primary-dark flex size-12 shrink-0 items-center justify-center rounded-full text-white">
          <Lock className="size-5" aria-hidden />
        </span>
        <p className="text-ink mt-3 font-bold">{lock.title}</p>
        <p className="text-meta mt-1 max-w-xs">{lock.detail}</p>
        <div className="mt-4">
          <ButtonLink href={routes.join(returnTo)}>{lock.cta}</ButtonLink>
        </div>
      </div>
    </div>
  );
}
