import Form from "next/form";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { routes } from "@/lib/routes";

// The primary search input. A plain GET form to /search?q=…, so Enter
// works everywhere and the query lives in the URL (easy to keep and share).
export function SearchBar({
  defaultValue = "",
  placeholder = "What are you looking for?",
}: {
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <Form action="/search" className="relative">
      <Search
        className="text-primary pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2"
        aria-hidden
      />
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label="What are you looking for?"
        className="bg-surface shadow-card text-body focus:ring-primary-soft h-14 w-full rounded-3xl pr-16 pl-13 outline-none focus:ring-2"
      />
      <button
        type="submit"
        aria-label="Search"
        className="bg-primary absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-white"
      >
        <ArrowRight className="size-5" aria-hidden />
      </button>
    </Form>
  );
}

// Horizontally scrollable prompts (design spec: suggestion chips).
export function PromptChips({ prompts }: { prompts: string[] }) {
  return (
    <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
      {prompts.map((prompt) => (
        <Link
          key={prompt}
          href={routes.search(prompt)}
          className="bg-surface border-suggestion-border text-body shrink-0 rounded-full border px-4 py-2 text-sm whitespace-nowrap"
        >
          {prompt}
        </Link>
      ))}
    </div>
  );
}
