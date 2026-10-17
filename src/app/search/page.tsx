import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import { enipApp } from "@/adapters/enip-app";
import { PageSkeleton } from "@/components/page-skeleton";
import { ProfileSheet, ResultCard } from "@/components/people";
import { PromptChips, SearchBar } from "@/components/search-bar";
import { examplePrompts } from "@/config/search";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Find people" };

// No sign-up wall here: students see who can help before being asked to join.
export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Results searchParams={searchParams} />
    </Suspense>
  );
}

async function Results({
  searchParams,
}: Pick<PageProps<"/search">, "searchParams">) {
  const { q, profile } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const profileId = typeof profile === "string" ? profile : undefined;

  const [people, selected] = await Promise.all([
    enipApp.searchAlumni(query),
    profileId ? enipApp.getAlumni(profileId) : null,
  ]);
  const resultsHref = routes.search(query);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <SearchBar defaultValue={query} />

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow">{query ? "Top matches" : "Everyone"}</p>
          <h1 className="text-title mt-1">People who can help</h1>
        </div>
        <p className="text-meta shrink-0">
          {people.length} {people.length === 1 ? "result" : "results"} found
        </p>
      </div>

      {people.length > 0 ? (
        <div className="mt-5 grid gap-4">
          {people.map((person) => (
            <ResultCard
              key={person.id}
              person={person}
              href={routes.search(query, person.id)}
            />
          ))}
        </div>
      ) : (
        <div className="card mt-5 text-center">
          <p className="text-card-title">No results found.</p>
          <p className="text-meta mt-1">
            Try different words, or start from one of these.
          </p>
          <div className="mt-4 text-left">
            <PromptChips prompts={examplePrompts} />
          </div>
          <Link
            href={routes.search()}
            className="text-primary mt-4 inline-block font-semibold hover:underline"
          >
            Browse everyone
          </Link>
        </div>
      )}

      {selected && (
        <ProfileSheet
          person={selected}
          closeHref={resultsHref}
          chatHref={routes.chat(selected.id, resultsHref)}
        />
      )}
    </div>
  );
}
