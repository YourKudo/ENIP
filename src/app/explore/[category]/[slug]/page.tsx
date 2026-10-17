import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AccessBadge, LockedSection } from "@/components/locked";
import { routes } from "@/lib/routes";
import {
  getAllItemPaths,
  getCategory,
  getItem,
  type Block,
} from "@/modules/content";

export function generateStaticParams() {
  return getAllItemPaths();
}

export async function generateMetadata({
  params,
}: PageProps<"/explore/[category]/[slug]">): Promise<Metadata> {
  const { category, slug } = await params;
  return { title: getItem(category, slug)?.title };
}

export default async function ContentPage({
  params,
}: PageProps<"/explore/[category]/[slug]">) {
  const { category: categorySlug, slug } = await params;
  const item = getItem(categorySlug, slug);
  const category = getCategory(categorySlug);
  if (!item || !category) notFound();

  const here = routes.content(categorySlug, slug);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href={routes.category(categorySlug)}
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← {category.title}
      </Link>
      <h1 className="mt-4 text-3xl font-bold leading-tight">{item.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <span>
          {item.author.name} · {item.author.tag}
        </span>
        <span>{item.minutes} min read</span>
        <AccessBadge access={item.access} />
      </div>

      <Blocks blocks={item.preview} />
      {item.body ? (
        <Blocks blocks={item.body} />
      ) : (
        <LockedSection
          access={item.access}
          hiddenCount={item.lockedBlockCount}
          returnTo={here}
        />
      )}
    </article>
  );
}

// Text blocks render as paragraphs; consecutive stat blocks as a grid.
function Blocks({ blocks }: { blocks: Block[] }) {
  const texts = blocks.filter((b) => b.type === "text");
  const stats = blocks.filter((b) => b.type === "stat");
  return (
    <div className="mt-6 space-y-4">
      {texts.map((b) => (
        <p key={b.text} className="leading-relaxed text-slate-700">
          {b.text}
        </p>
      ))}
      {stats.length > 0 && (
        <dl className="grid grid-cols-2 gap-3">
          {stats.map((b) => (
            <div key={b.label} className="rounded-xl border border-slate-200 p-4">
              <dt className="text-sm text-slate-500">{b.label}</dt>
              <dd className="mt-1 text-2xl font-bold">{b.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
