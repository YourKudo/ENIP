import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentCard } from "@/components/cards";
import {
  getCategories,
  getCategory,
  getItemsInCategory,
} from "@/modules/content";

export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/explore/[category]">): Promise<Metadata> {
  const { category } = await params;
  return { title: getCategory(category)?.title };
}

export default async function CategoryPage({
  params,
}: PageProps<"/explore/[category]">) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const items = getItemsInCategory(slug);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-title">{category.title}</h1>
      <p className="text-body mt-2">{category.blurb}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ContentCard key={item.slug} item={item} />
        ))}
      </div>
    </div>
  );
}
