import Link from "next/link";

import { routes } from "@/lib/routes";
import type { ContentView } from "@/modules/content";
import { AccessBadge } from "./locked";

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
