import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  ShieldCheck,
} from "lucide-react";

import { enipApp } from "@/adapters/enip-app";
import { ButtonLink } from "@/components/button-link";
import { Glimpse } from "@/components/landing/glimpse";
import { ResultCard } from "@/components/people";
import { SearchBar } from "@/components/search-bar";
import { getCategories } from "@/modules/content";
import { routes } from "@/lib/routes";

export default function HomePage() {
  const resourceCategories = getCategories().filter((category) =>
    ["interview-guides", "resources", "placement-stories"].includes(
      category.slug,
    ),
  );

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <p className="landing-kicker">
              <span className="landing-kicker-dot" /> ENIP by YAL · for IITians
            </p>
            <h1>NO INTRODUCTION NEEDED.</h1>
            <p className="landing-hero-description">
              For minds that never quite fit the ordinary. Your average network
              could never.
            </p>
            <div className="landing-hero-actions">
              <ButtonLink href={routes.search()}>
                Discover alumni <ArrowRight size={18} aria-hidden />
              </ButtonLink>
              <Link
                className="landing-text-link"
                href={routes.category("resources")}
              >
                Explore resources <ArrowUpRight size={17} aria-hidden />
              </Link>
            </div>
            <p className="landing-trust-line">
              <ShieldCheck size={17} aria-hidden />A network built around real
              conversations and shared experience
            </p>
          </div>
          <HeroPhones />
        </div>
      </section>

      <section className="landing-section landing-discovery" id="alum-chat">
        <div className="landing-section-heading">
          <p className="landing-eyebrow">Alum Chat</p>
          <h2>Your seniors, unfiltered.</h2>
          <p>
            Chat anonymously with alumni in consulting, finance, product, core
            and more. Ask what the job is really like
          </p>
        </div>
        <div className="landing-search-wrap">
          <SearchBar placeholder="Search by company, role, IIT or career goal..." />
        </div>
        <div className="landing-demo-label">
          <span>People you can learn from</span>
          <span>Demo profiles</span>
        </div>
        <Suspense fallback={<DiscoveryProfilesSkeleton />}>
          <DiscoveryProfiles />
        </Suspense>
        <div className="landing-centered-action">
          <ButtonLink href={routes.search()} variant="secondary">
            Discover alumni <ArrowRight size={17} aria-hidden />
          </ButtonLink>
        </div>
      </section>

      <section className="landing-showcase">
        <div className="landing-section landing-showcase-inner">
          <div className="landing-section-heading landing-section-heading-center">
            <h2>Glimpse to ENIP Experience</h2>
          </div>
          <Glimpse />
        </div>
      </section>

      <section className="landing-section landing-cv-section" id="cv-review">
        <div className="landing-cv-copy">
          <p className="landing-eyebrow">CV Review · concept preview</p>
          <h2>Give your resume a stronger shot at the shortlist.</h2>
          <p>
            A preview of structured, ATS-style checks and practical feedback
            from people in your field. The score shown here is illustrative; it
            is not an analysis of a submitted CV.
          </p>
          <ButtonLink href={routes.cvReview}>
            Explore CV review <ArrowRight size={18} aria-hidden />
          </ButtonLink>
        </div>
        <ResumePreview />
      </section>

      <section className="landing-section landing-community">
        <div className="landing-resources">
          <div className="landing-resource-heading">
            <div>
              <p className="landing-eyebrow">Keep exploring</p>
              <h3>Useful ideas for the road ahead.</h3>
            </div>
            <Link
              className="landing-text-link"
              href={routes.category("resources")}
            >
              All resources <ArrowUpRight size={17} aria-hidden />
            </Link>
          </div>
          <div className="landing-resource-grid">
            {resourceCategories.map((category) => (
              <Link
                className="landing-resource-card"
                href={routes.category(category.slug)}
                key={category.slug}
              >
                <span>{category.title}</span>
                <ArrowUpRight size={18} aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-final-cta">
        <div>
          <p className="landing-eyebrow">Your next conversation</p>
          <h2>You don’t have to figure it all out alone.</h2>
          <p>Start with one question. See where it takes you.</p>
        </div>
        <div className="landing-hero-actions">
          <ButtonLink href={routes.search()}>
            Find someone to talk to <ArrowRight size={18} aria-hidden />
          </ButtonLink>
          <Link className="landing-text-link" href={routes.join()}>
            Sign up <ArrowUpRight size={17} aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}

// Seniors come from the database, so they stream in after the static page.
async function DiscoveryProfiles() {
  const people = await enipApp.searchAlumni("");
  const alumni = people.filter((person) => person.memberType === "alumni");
  return (
    <div className="landing-profile-grid">
      {alumni.slice(0, 3).map((person) => (
        <ResultCard
          key={person.id}
          person={person}
          href={routes.search("", person.id)}
          className="landing-result-card"
        />
      ))}
    </div>
  );
}

function DiscoveryProfilesSkeleton() {
  return (
    <div className="landing-profile-grid" aria-busy>
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-card bg-chip h-56 animate-pulse" />
      ))}
    </div>
  );
}

// Intrinsic size of the hero mockup images in public/landing/.
const HERO_PHONE_WIDTH = 640;
const HERO_PHONE_HEIGHT = 1200;

function HeroPhones() {
  return (
    <div className="landing-hero-visual">
      <Image
        className="landing-phone landing-phone-back"
        src="/landing/hero-chats.png"
        alt="ENIP chats screen listing anonymous conversations and groups"
        width={HERO_PHONE_WIDTH}
        height={HERO_PHONE_HEIGHT}
        sizes="(max-width: 600px) 64vw, 272px"
        preload
      />
      <Image
        className="landing-phone landing-phone-front"
        src="/landing/hero-welcome.png"
        alt="ENIP welcome screen: step into your IIT network, anonymously"
        width={HERO_PHONE_WIDTH}
        height={HERO_PHONE_HEIGHT}
        sizes="(max-width: 600px) 64vw, 272px"
        preload
      />
    </div>
  );
}

function ResumePreview() {
  return (
    <div className="landing-resume-wrap">
      <div className="landing-resume-card">
        <div className="resume-preview-topline">
          <FileText size={16} />
          <span>Resume review preview</span>
          <span className="resume-demo-pill">Illustrative</span>
        </div>
        <div className="resume-paper">
          <div className="resume-name-line" />
          <div className="resume-contact-line" />
          <div className="resume-section-title">EXPERIENCE</div>
          <div className="resume-line resume-line-wide" />
          <div className="resume-line" />
          <div className="resume-line resume-line-mid" />
          <div className="resume-section-title">PROJECTS</div>
          <div className="resume-line resume-line-wide" />
          <div className="resume-line resume-line-mid" />
          <div className="resume-line" />
          <div className="resume-section-title">SKILLS</div>
          <div className="resume-line resume-line-mid" />
        </div>
        <div className="resume-score-row">
          <div className="resume-score">
            <strong>82</strong>
            <span>Illustrative score</span>
          </div>
          <div className="resume-checks">
            <span>
              <Check size={13} /> Clear sections
            </span>
            <span>
              <Check size={13} /> Impact prompts
            </span>
            <span>
              <Check size={13} /> Role alignment
            </span>
          </div>
        </div>
      </div>
      <span className="resume-float-note">
        <ShieldCheck size={16} /> Concept preview only
      </span>
    </div>
  );
}
