import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  FileCheck2,
  FolderOpen,
  Search,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";

import { ButtonLink } from "@/components/button-link";
import { PromptChips, SearchBar } from "@/components/search-bar";
import { examplePrompts, searchIntents } from "@/config/search";
import { routes } from "@/lib/routes";
import {
  getCategories,
  getTestimonials,
  type CategorySlug,
} from "@/modules/content";

const categoryIcons: Record<CategorySlug, typeof BookOpen> = {
  "interview-guides": BookOpen,
  resources: FolderOpen,
  "placement-stories": Trophy,
  "placement-stats": BarChart3,
};

export default function HomePage() {
  return (
    <>
      {/* 1. Search with intent: the main focus of the page. */}
      <section className="from-banner to-bg bg-gradient-to-b">
        <div className="mx-auto max-w-3xl px-6 pt-12 pb-10 md:pt-20">
          <p className="text-eyebrow">ENIP by YAL</p>
          <h1 className="text-title mt-2 md:text-5xl">
            Find the right person. Ask anything.
          </h1>
          <p className="text-body mt-3">
            An anonymous network exclusively for IITians.
          </p>
          <div className="mt-8">
            <SearchBar />
          </div>
          <div className="mt-4">
            <PromptChips prompts={examplePrompts} />
          </div>
        </div>
      </section>

      {/* 2. What you can do here: each card fills the search. */}
      <Section eyebrow="What you can do here" title="Start with what you need">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {searchIntents.map(({ label, query, icon: Icon }) => (
            <Link
              key={label}
              href={routes.search(query)}
              className="card flex items-center gap-3 p-4 transition-shadow duration-200 hover:shadow-lg"
            >
              <span className="bg-chip text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-ink text-sm leading-snug font-semibold">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Two ways in. Same short form either way; only where you land
          afterwards differs (the chat, or the waitlist). */}
      <Section eyebrow="Two ways in" title="Try it, or join the network">
        <div className="grid gap-4 sm:grid-cols-2">
          <PathCard
            icon={<Search className="size-5" aria-hidden />}
            title="Try it now"
            text="Search, open profiles and send your first message free. We'll ask for a few details when you start a chat."
            cta={
              <ButtonLink href={routes.search()} fullWidth>
                Find someone
              </ButtonLink>
            }
          />
          <PathCard
            icon={<Users className="size-5" aria-hidden />}
            title="Join the network"
            text="Get on the waitlist for full access. Refer IITian friends to move up and earn points."
            cta={
              <ButtonLink href={routes.join()} variant="secondary" fullWidth>
                Join the waitlist
              </ButtonLink>
            }
          />
        </div>
      </Section>

      {/* Free content library (PRD curiosity points). */}
      <Section eyebrow="Free previews" title="Guides, stories and stats">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {getCategories().map((category) => {
            const Icon = categoryIcons[category.slug];
            return (
              <LibraryTile
                key={category.slug}
                href={routes.category(category.slug)}
                icon={<Icon className="size-5" aria-hidden />}
                title={category.title}
              />
            );
          })}
          <LibraryTile
            href={routes.cvReview}
            icon={<FileCheck2 className="size-5" aria-hidden />}
            title="CV score & review"
          />
        </div>
      </Section>

      <Section eyebrow="Testimonials" title="What students say">
        <div className="grid gap-4 md:grid-cols-3">
          {getTestimonials().map((t) => (
            <figure key={t.name} className="card">
              <blockquote className="text-body">“{t.quote}”</blockquote>
              <figcaption className="text-meta mt-3">
                <span className="text-ink font-semibold">{t.name}</span> ·{" "}
                {t.tag}
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* 3. Trust and exclusivity. */}
      <p className="text-meta mx-auto flex max-w-3xl items-center justify-center gap-2 px-6 pt-2 pb-12 text-center">
        <ShieldCheck className="text-primary size-4 shrink-0" aria-hidden />
        Built exclusively for IITians. Anonymous by default.
      </p>
    </>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-7">
      <p className="text-eyebrow">{eyebrow}</p>
      <h2 className="text-title mt-1 mb-5">{title}</h2>
      {children}
    </section>
  );
}

function PathCard({
  icon,
  title,
  text,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  cta: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col">
      <span className="bg-chip text-primary flex size-10 items-center justify-center rounded-xl">
        {icon}
      </span>
      <p className="text-card-title mt-3">{title}</p>
      <p className="text-meta mt-1 flex-1">{text}</p>
      <div className="mt-4">{cta}</div>
    </div>
  );
}

function LibraryTile({
  href,
  icon,
  title,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="card group flex flex-col gap-3 p-4 transition-shadow duration-200 hover:shadow-lg"
    >
      <span className="bg-chip text-primary flex size-10 items-center justify-center rounded-xl">
        {icon}
      </span>
      <span className="text-ink group-hover:text-primary text-sm leading-snug font-semibold">
        {title}
      </span>
    </Link>
  );
}
