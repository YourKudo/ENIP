import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  FileCheck2,
  FolderOpen,
  MessageCircle,
  Trophy,
} from "lucide-react";

import { enipApp } from "@/adapters/enip-app";
import { ButtonLink } from "@/components/button-link";
import { AlumniCard } from "@/components/cards";
import { routes } from "@/lib/routes";
import {
  getCategories,
  getPlatformStats,
  getTestimonials,
  type CategorySlug,
} from "@/modules/content";

const categoryIcons: Record<CategorySlug, typeof BookOpen> = {
  "interview-guides": BookOpen,
  resources: FolderOpen,
  "placement-stories": Trophy,
  "placement-stats": BarChart3,
};

const steps = [
  { title: "Explore", text: "Browse guides, stories and stats. No sign-up needed." },
  { title: "Verify", text: "Confirm your IIT email with a one-time code." },
  { title: "Chat", text: "Message a senior. Your first conversation is free." },
  { title: "Refer", text: "Invite friends to skip the waitlist and earn points." },
];

export default async function HomePage() {
  const alumni = (await enipApp.listAlumni()).slice(0, 3);

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 pt-14 pb-12 md:pt-20">
          <p className="text-sm font-semibold text-brand-700">
            For 3rd and 4th year IIT students
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            Talk to IIT seniors who&apos;ve been where you&apos;re headed.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Placement and internship guidance, interview prep and CV reviews from
            alumni at the companies you&apos;re aiming for.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={routes.alumni}>
              <MessageCircle className="size-4" aria-hidden />
              Start a free chat
            </ButtonLink>
            <ButtonLink href={routes.category("interview-guides")} variant="secondary">
              Explore resources
            </ButtonLink>
          </div>
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            {getPlatformStats().map((stat) => (
              <div key={stat.label}>
                <dt className="text-sm text-slate-500">{stat.label}</dt>
                <dd className="text-2xl font-bold">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold">Explore before you sign up</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {getCategories().map((category) => {
            const Icon = categoryIcons[category.slug];
            return (
              <CategoryTile
                key={category.slug}
                href={routes.category(category.slug)}
                icon={<Icon className="size-5" aria-hidden />}
                title={category.title}
                blurb={category.blurb}
              />
            );
          })}
          <CategoryTile
            href={routes.cvReview}
            icon={<FileCheck2 className="size-5" aria-hidden />}
            title="CV score & review"
            blurb="Get your CV scored and reviewed by a senior in your field."
          />
          <CategoryTile
            href={routes.alumni}
            icon={<MessageCircle className="size-5" aria-hidden />}
            title="Alumni chat"
            blurb="Ask seniors about roles, companies and preparation."
          />
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold">Seniors you can talk to</h2>
            <Link
              href={routes.alumni}
              className="text-sm font-semibold text-brand-700 hover:underline"
            >
              See all
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {alumni.map((person) => (
              <AlumniCard key={person.id} person={person} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold">How it works</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-xl border border-slate-200 p-5">
              <span className="text-sm font-semibold text-brand-600">Step {i + 1}</span>
              <p className="mt-1 font-semibold">{step.title}</p>
              <p className="mt-1 text-sm text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold">What students say</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {getTestimonials().map((t) => (
              <figure key={t.name} className="rounded-xl border border-slate-200 bg-white p-5">
                <blockquote className="text-slate-700">“{t.quote}”</blockquote>
                <figcaption className="mt-3 text-sm text-slate-500">
                  {t.name} · {t.tag}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 text-center">
        <h2 className="text-2xl font-bold">Your first chat with a senior is free</h2>
        <p className="mt-2 text-slate-600">Verify your IIT email to get started.</p>
        <div className="mt-6">
          <ButtonLink href={routes.join()}>
            Join free <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

function CategoryTile({
  href,
  icon,
  title,
  blurb,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  blurb: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
    >
      <span className="inline-flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        {icon}
      </span>
      <p className="mt-3 font-semibold group-hover:text-brand-700">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{blurb}</p>
    </Link>
  );
}
