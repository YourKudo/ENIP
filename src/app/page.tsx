import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  MessageCircle,
  Search,
  ShieldCheck,
} from "lucide-react";

import { enipApp } from "@/adapters/enip-app";
import { ButtonLink } from "@/components/button-link";
import { ResultCard } from "@/components/people";
import { SearchBar } from "@/components/search-bar";
import { getCategories } from "@/modules/content";
import { routes } from "@/lib/routes";

const previewFeatures = [
  {
    number: "01",
    title: "Discover",
    description:
      "A concept preview for finding people by the work they do and the help they can offer.",
    kind: "discover" as const,
  },
  {
    number: "02",
    title: "Spark",
    description:
      "A conversation-starting concept. ENIP’s current demo uses simple suggested openers in chat.",
    kind: "spark" as const,
  },
  {
    number: "03",
    title: "Jobs",
    description:
      "A placeholder for opportunity discovery. This preview does not include a live jobs board.",
    kind: "jobs" as const,
  },
];

export default async function HomePage() {
  const [people, categories] = await Promise.all([
    enipApp.searchAlumni(""),
    getCategories(),
  ]);
  const alumni = people.filter((person) => person.memberType === "alumni");
  const discoveryPeople = alumni.slice(0, 3);
  const seniorSpotlights = alumni.slice(3, 6);

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <p className="landing-kicker">
              <span className="landing-kicker-dot" /> ENIP by YAL · for IITians
            </p>
            <h1>Your next opportunity starts with a conversation.</h1>
            <p className="landing-hero-description">
              Get thoughtful career guidance from alumni who have been where you
              want to go, and prepare for the steps ahead.
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
          <h2>Talk to someone who’s already made the move.</h2>
          <p>
            Find a senior with experience in the role, company, or career path
            you’re exploring.
          </p>
        </div>
        <div className="landing-search-wrap">
          <SearchBar placeholder="Search by company, role, IIT or career goal..." />
        </div>
        <div className="landing-demo-label">
          <span>People you can learn from</span>
          <span>Demo profiles</span>
        </div>
        <div className="landing-profile-grid">
          {discoveryPeople.map((person) => (
            <ResultCard
              key={person.id}
              person={person}
              href={routes.search("", person.id)}
            />
          ))}
        </div>
        <div className="landing-centered-action">
          <ButtonLink href={routes.search()} variant="secondary">
            Discover alumni <ArrowRight size={17} aria-hidden />
          </ButtonLink>
        </div>
      </section>

      <section className="landing-showcase">
        <div className="landing-section landing-showcase-inner">
          <div className="landing-section-heading landing-section-heading-center">
            <p className="landing-eyebrow">A network for what’s next</p>
            <h2>Make your next step feel a little closer.</h2>
            <p>
              Explore these product concepts. The screens below are illustrative
              previews built from ENIP’s demo content.
            </p>
          </div>
          <div className="landing-feature-grid">
            {previewFeatures.map((feature) => (
              <article className="landing-feature" key={feature.kind}>
                <span className="landing-feature-number">{feature.number}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <FeaturePhone kind={feature.kind} />
              </article>
            ))}
          </div>
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
        <div className="landing-section-heading">
          <p className="landing-eyebrow">Learn from experience</p>
          <h2>Good advice starts with the right perspective.</h2>
          <p>
            Meet people from different paths and explore practical resources
            made for the decisions ahead.
          </p>
        </div>
        <div className="landing-demo-label">
          <span>Senior spotlights</span>
          <span>Demo profiles</span>
        </div>
        <div className="landing-profile-grid">
          {seniorSpotlights.map((person) => (
            <ResultCard
              key={person.id}
              person={person}
              href={routes.search("", person.id)}
            />
          ))}
        </div>

        <div className="landing-testimonials">
          <div>
            <p className="landing-eyebrow">Student voices</p>
            <h3>Stories from the community, coming soon.</h3>
          </div>
          <div className="landing-testimonial-placeholder">
            <span>Testimonial placeholder</span>
            <p>Verified student stories will appear here when available.</p>
          </div>
          <div className="landing-testimonial-placeholder">
            <span>Testimonial placeholder</span>
            <p>
              We’ll share real experiences, with permission, in a future update.
            </p>
          </div>
        </div>

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
            {categories.map((category) => (
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

function HeroPhones() {
  return (
    <div
      className="landing-hero-visual"
      role="img"
      aria-label="Illustrative ENIP previews showing alumni discovery and a sample conversation"
    >
      <div className="landing-phone landing-phone-back" aria-hidden="true">
        <PhoneTopbar title="People for you" />
        <div className="phone-search">
          <Search size={13} /> Find a career guide
        </div>
        <MiniPerson
          initials="RM"
          name="Rohan Mehta"
          detail="SWE · Microsoft"
          tag="Resume reviews"
        />
        <MiniPerson
          initials="IV"
          name="Ishaan Verma"
          detail="APM · Consumer tech"
          tag="Product prep"
        />
        <MiniPerson
          initials="CS"
          name="@civil2code"
          detail="SWE · Google"
          tag="Branch switch"
        />
        <div className="phone-bottom-nav">
          <span>Discover</span>
          <span>Messages</span>
          <span>Profile</span>
        </div>
      </div>
      <div className="landing-phone landing-phone-front" aria-hidden="true">
        <PhoneTopbar title="Alum Chat" />
        <div className="phone-chat-person">
          <span className="phone-avatar">RM</span>
          <span>
            <b>Rohan Mehta</b>
            <small>Alumni · Software Engineer</small>
          </span>
        </div>
        <div className="phone-chat-date">TODAY</div>
        <div className="phone-bubble phone-bubble-in">
          Happy to help. What roles are you exploring?
        </div>
        <div className="phone-bubble phone-bubble-out">
          I’m preparing for software placements.
        </div>
        <div className="phone-message-box">
          Write a message… <MessageCircle size={14} />
        </div>
        <p className="phone-demo-caption">Sample conversation preview</p>
      </div>
      <span className="landing-visual-caption">
        Illustrative screens · sample data
      </span>
    </div>
  );
}

function PhoneTopbar({ title }: { title: string }) {
  return (
    <div className="phone-topbar">
      <span className="phone-camera" />
      <span>{title}</span>
      <span className="phone-topbar-menu">•••</span>
    </div>
  );
}

function MiniPerson({
  initials,
  name,
  detail,
  tag,
}: {
  initials: string;
  name: string;
  detail: string;
  tag: string;
}) {
  return (
    <div className="phone-mini-person">
      <span className="phone-avatar">{initials}</span>
      <span className="phone-mini-copy">
        <b>{name}</b>
        <small>{detail}</small>
        <em>{tag}</em>
      </span>
    </div>
  );
}

function FeaturePhone({ kind }: { kind: "discover" | "spark" | "jobs" }) {
  return (
    <div
      className={`landing-feature-phone landing-feature-phone-${kind}`}
      aria-hidden="true"
    >
      <div className="feature-phone-notch" />
      {kind === "discover" && (
        <>
          <span className="feature-phone-label">Explore people</span>
          <div className="feature-phone-heading">
            Who can help with your next step?
          </div>
          <div className="feature-phone-filter">
            <Search size={12} /> Career guidance
          </div>
          <MiniPerson
            initials="PM"
            name="Priya M."
            detail="Product · IIT Delhi"
            tag="Mock profile"
          />
          <MiniPerson
            initials="AK"
            name="Aarav K."
            detail="Founder · IIT Bombay"
            tag="Mock profile"
          />
        </>
      )}
      {kind === "spark" && (
        <>
          <span className="feature-phone-label">
            Conversation starter · concept
          </span>
          <div className="spark-orb">
            <MessageCircle size={24} />
          </div>
          <div className="feature-phone-heading">
            Make the first message easier.
          </div>
          <div className="spark-prompt">
            “What helped you most when you moved into product?”
          </div>
          <div className="spark-note">Illustrative prompt</div>
        </>
      )}
      {kind === "jobs" && (
        <>
          <span className="feature-phone-label">Opportunities · concept</span>
          <div className="feature-phone-heading">
            Explore work through people.
          </div>
          <div className="job-preview-card">
            <span>Example opportunity</span>
            <b>Product Intern</b>
            <small>Details not connected</small>
            <span className="job-preview-link">
              View preview <ArrowRight size={12} />
            </span>
          </div>
          <div className="job-preview-card job-preview-muted">
            <span>Example opportunity</span>
            <b>Software Intern</b>
            <small>Placeholder content</small>
          </div>
        </>
      )}
      <div className="feature-phone-home" />
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
