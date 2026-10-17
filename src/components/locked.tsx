import { Lock } from "lucide-react";

import { routes } from "@/lib/routes";
import { describeLock, type Access } from "@/modules/content";
import { ButtonLink } from "./button-link";

// Small label for cards: "Free", "Sign up", or "20 pts".
export function AccessBadge({ access }: { access: Access }) {
  if (access.kind === "free") {
    return (
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        Free
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
      <Lock className="size-3" aria-hidden />
      {access.kind === "points" ? `${access.cost} pts` : "Sign up"}
    </span>
  );
}

// Stands in for hidden content. It draws placeholder lines, not the real
// text, because the real text is never sent to the browser.
export function LockedSection({
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
    <div className="relative mt-6 overflow-hidden rounded-xl border border-slate-200">
      <div aria-hidden className="space-y-3 p-6 blur-[3px]">
        {Array.from({ length: Math.max(hiddenCount, 2) * 2 }, (_, i) => (
          <div
            key={i}
            className="h-3 rounded bg-slate-200"
            style={{ width: `${90 - ((i * 17) % 35)}%` }}
          />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/60 p-4">
        <div className="max-w-sm rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <Lock className="mx-auto size-5 text-brand-600" aria-hidden />
          <p className="mt-2 font-semibold">{lock.title}</p>
          <p className="mt-1 text-sm text-slate-600">{lock.detail}</p>
          <div className="mt-4">
            <ButtonLink href={routes.join(returnTo)}>{lock.cta}</ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
