import Link from "next/link";
import { MessageCircle } from "lucide-react";

import type { AlumniProfile } from "@/adapters/enip-app";
import { routes } from "@/lib/routes";
import type { ContentView } from "@/modules/content";
import { ButtonLink } from "./button-link";
import { AccessBadge } from "./locked";
import { Avatar } from "./ui/avatar";
import { MemberBadge } from "./ui/badge";
import { TagChips } from "./ui/tag-chips";

export function ContentCard({ item }: { item: ContentView }) {
  return (
    <Link
      href={routes.content(item.category, item.slug)}
      className="card flex flex-col transition-shadow duration-200 hover:shadow-lg"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-meta">{item.minutes} min read</span>
        <AccessBadge access={item.access} />
      </div>
      <h3 className="text-ink mt-3 text-lg leading-snug font-bold">
        {item.title}
      </h3>
      <p className="text-body mt-1">{item.summary}</p>
      <p className="text-meta mt-4">
        {item.author.name} · {item.author.tag}
      </p>
    </Link>
  );
}

// "Match card" from the design spec: avatar, badge, name, role, 3 tags.
export function AlumniCard({ person }: { person: AlumniProfile }) {
  return (
    <div className="card border-line-strong flex flex-col border">
      <div className="flex items-start justify-between gap-3">
        <Avatar name={person.name} />
        <MemberBadge type={person.memberType} />
      </div>
      <p className="text-card-title mt-4">{person.name}</p>
      <p className="mt-1">
        <span className="text-primary font-semibold">
          {person.jobTitle} @ {person.company}
        </span>
      </p>
      <p className="text-meta mt-1">
        {person.institute} · {person.branch} &apos;
        {String(person.batch).slice(2)}
      </p>
      <div className="mt-4 flex-1">
        <TagChips tags={person.topics} />
      </div>
      <div className="mt-5">
        <ButtonLink href={routes.join(routes.alumni)} fullWidth>
          <MessageCircle className="size-5" aria-hidden />
          Start conversation
        </ButtonLink>
      </div>
    </div>
  );
}
