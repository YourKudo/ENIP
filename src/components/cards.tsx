import Link from "next/link";
import { BadgeCheck, MessageCircle } from "lucide-react";

import type { AlumniProfile } from "@/adapters/enip-app";
import { routes } from "@/lib/routes";
import type { ContentView } from "@/modules/content";
import { ButtonLink } from "./button-link";
import { AccessBadge } from "./locked";

export function ContentCard({ item }: { item: ContentView }) {
  return (
    <Link
      href={routes.content(item.category, item.slug)}
      className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
        <span>{item.minutes} min read</span>
        <AccessBadge access={item.access} />
      </div>
      <h3 className="mt-3 font-semibold leading-snug">{item.title}</h3>
      <p className="mt-1 text-sm text-slate-600">{item.summary}</p>
      <p className="mt-4 text-xs text-slate-500">
        {item.author.name} · {item.author.tag}
      </p>
    </Link>
  );
}

export function AlumniCard({ person }: { person: AlumniProfile }) {
  const initials = person.name
    .split(" ")
    .map((part) => part[0])
    .join("");
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-1 font-semibold">
            {person.name}
            {person.isEnipTeam && (
              <BadgeCheck className="size-4 text-brand-600" aria-hidden />
            )}
          </p>
          <p className="truncate text-sm text-slate-600">
            {person.role} · {person.company}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {person.isEnipTeam
          ? "ENIP team mentor"
          : `${person.institute} · ${person.branch} '${String(person.batch).slice(2)}`}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {person.topics.map((topic) => (
          <span
            key={topic}
            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
          >
            {topic}
          </span>
        ))}
      </div>
      <div className="mt-4">
        <ButtonLink href={routes.join(routes.alumni)} variant="secondary">
          <MessageCircle className="size-4" aria-hidden />
          Message
        </ButtonLink>
      </div>
    </div>
  );
}
