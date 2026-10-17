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
  {
    title: "Explore",
    text: "Browse guides, stories and stats. No sign-up needed.",
  },
  { title: "Verify", text: "Confirm your IIT email with a one-time code." },
  { title: "Chat", text: "Message a senior. Your first conversation is free." },
  {
    title: "Refer",
    text: "Invite friends to skip the waitlist and earn points.",
  },
];

export default async function HomePage() {
  const alumni = (await enipApp.listAlumni()).slice(0, 3);

  return (
    <>
      <section className="from-banner to-bg bg-gradient-to-b">
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-10 md:pt-20">
          <p className="text-eyebrow">
            ENIP by YAL · For 3rd & 4th year IITians
          </p>
          <h1 className="text-title mt-2 max-w-2xl md:text-5xl">
            Talk to IIT seniors who&apos;ve been where you&apos;re headed.
          </h1>
          <p className="text-body mt-4 max-w-2xl">
            Placement and internship guidance, interview prep and CV reviews
            from alumni at the companies you&apos;re aiming for.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={routes.alumni}>
              <MessageCircle className="size-5" aria-hidden />
              Start a free chat
            </ButtonLink>
            <ButtonLink
              href={routes.category("interview-guides")}
              variant="secondary"
            >
              Explore resources
            </ButtonLink>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-3">
            {getPlatformStats().map((stat) => (
              <div
                key={stat.label}
                className="card flex flex-col-reverse px-4 py-3"
              >
                <dt className="text-meta">{stat.label}</dt>
                <dd className="text-ink text-xl font-bold">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Section eyebrow="Free previews" title="Explore before you sign up">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {getCategories().map((category) => {
            const Icon = categoryIcons[category.slug];
            return (
              <CategoryTile
                key={category.slug}
                href={routes.category(category.slug)}
                icon={<Icon className="size-6" aria-hidden />}
                title={category.title}
                blurb={category.blurb}
              />
            );
          })}
          <CategoryTile
            href={routes.cvReview}
            icon={<FileCheck2 className="size-6" aria-hidden />}
            title="CV score & review"
            blurb="Get your CV scored and reviewed by a senior in your field."
          />
          <CategoryTile
            href={routes.alumni}
            icon={<MessageCircle className="size-6" aria-hidden />}
            title="Alumni chat"
            blurb="Ask seniors about roles, companies and preparation."
          />
        </div>
      </Section>

      <Section
        eyebrow="Top matches today"
        title="Seniors you can talk to"
        action={
          <Link
            href={routes.alumni}
            className="text-primary shrink-0 font-semibold whitespace-nowrap hover:underline"
          >
            See all
          </Link>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {alumni.map((person) => (
            <AlumniCard key={person.id} person={person} />
          ))}
        </div>
      </Section>

      <Section eyebrow="How it works" title="From curious to connected">
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="card">
              <span className="bg-chip text-primary flex size-8 items-center justify-center rounded-full text-sm font-bold">
                {i + 1}
              </span>
              <p className="text-ink mt-3 font-bold">{step.title}</p>
              <p className="text-meta mt-1">{step.text}</p>
            </li>
          ))}
        </ol>
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

      <section className="mx-auto max-w-6xl px-6 pt-4 pb-16">
        <div className="card from-banner to-surface bg-gradient-to-b py-10 text-center">
          <h2 className="text-title">Your first chat with a senior is free</h2>
          <p className="text-body mt-2">
            Verify your IIT email to get started.
          </p>
          <div className="mt-6">
            <ButtonLink href={routes.join()}>
              Join free <ArrowRight className="size-5" aria-hidden />
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

function Section({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow">{eyebrow}</p>
          <h2 className="text-title mt-1">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
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
      className="card group flex flex-col transition-shadow duration-200 hover:shadow-lg"
    >
      <span className="bg-chip text-primary flex size-12 items-center justify-center rounded-2xl">
        {icon}
      </span>
      <p className="text-ink group-hover:text-primary mt-3 leading-snug font-bold">
        {title}
      </p>
      <p className="text-meta mt-1 hidden sm:block">{blurb}</p>
    </Link>
  );
}
