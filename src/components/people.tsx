import Link from "next/link";
import { ChevronRight, Lock, MessageCircle, X } from "lucide-react";

import type { AlumniProfile, MemberType } from "@/adapters/enip-app";
import { ButtonLink } from "./button-link";
import { Avatar } from "./ui/avatar";
import { MemberBadge } from "./ui/badge";
import { TagChips } from "./ui/tag-chips";

// FR-18: never call a YAL team member or EIR an "alum".
const chatLabels: Record<MemberType, string> = {
  alumni: "Chat with this alum",
  founder: "Chat with this founder",
  "yal-team": "Chat with this mentor",
  eir: "Chat with this mentor",
};

function batchLine(person: AlumniProfile) {
  return `${person.institute} · ${person.branch} '${String(person.batch).slice(2)}`;
}

// Compact search result. Tapping it opens the profile sheet.
export function ResultCard({
  person,
  href,
}: {
  person: AlumniProfile;
  href: string;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className="card flex min-w-0 flex-col gap-4 transition-shadow duration-200 hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        <Avatar
          name={person.displayName}
          imageUrl={person.avatarUrl}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-ink truncate text-lg font-bold">
              {person.displayName}
            </p>
            <MemberBadge type={person.memberType} />
          </div>
          <p className="text-primary truncate text-sm font-semibold">
            {person.jobTitle} @ {person.company}
          </p>
          <p className="text-meta mt-1 line-clamp-2">{person.helpWith}</p>
        </div>
      </div>
      <TagChips tags={person.topics} />
      <span className="text-primary inline-flex items-center gap-1 self-end text-sm font-semibold">
        View profile <ChevronRight className="size-4" aria-hidden />
      </span>
    </Link>
  );
}

// Bottom sheet on phones, centred panel on desktop. Opened by the
// `profile` search param, so it works without JavaScript and the back
// button closes it.
export function ProfileSheet({
  person,
  closeHref,
  chatHref,
}: {
  person: AlumniProfile;
  closeHref: string;
  chatHref: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <Link
        href={closeHref}
        scroll={false}
        aria-label="Close profile"
        className="bg-ink/40 absolute inset-0"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-name"
        className="bg-bg rounded-t-card sm:rounded-card relative flex max-h-[88dvh] w-full max-w-[480px] flex-col overflow-hidden"
      >
        <div className="overflow-y-auto">
          <div className="from-banner to-bg bg-gradient-to-b px-6 pt-5 pb-6">
            <div className="flex justify-between">
              <Link
                href={closeHref}
                scroll={false}
                aria-label="Close profile"
                className="text-primary"
              >
                <X className="size-7" strokeWidth={2} aria-hidden />
              </Link>
              <MemberBadge type={person.memberType} />
            </div>
            <div className="mt-2 flex flex-col items-center text-center">
              <Avatar name={person.displayName} imageUrl={person.avatarUrl} />
              <h2 id="profile-name" className="text-card-title mt-3">
                {person.displayName}
              </h2>
              <p className="text-primary font-semibold">
                {person.jobTitle} @ {person.company}
              </p>
              <p className="text-meta mt-1">{batchLine(person)}</p>
            </div>
          </div>

          <div className="space-y-6 px-6 pb-6">
            <SheetSection title="How I can help">
              <p className="card text-body">{person.helpWith}</p>
            </SheetSection>
            <SheetSection title="Topics">
              <TagChips tags={person.topics} max={person.topics.length} />
            </SheetSection>
            <SheetSection title="Contacts" note="Locked until mutual consent">
              <div className="card space-y-4">
                {["Real name", "Mobile", "LinkedIn"].map((label) => (
                  <LockedField key={label} label={label} />
                ))}
              </div>
            </SheetSection>
          </div>
        </div>

        <div className="border-line bg-bg border-t px-6 py-4">
          <ButtonLink href={chatHref} fullWidth>
            <MessageCircle className="size-5" aria-hidden />
            {chatLabels[person.memberType]}
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}

function SheetSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="text-ink mb-2 font-bold">
        {title}
        {note && <span className="text-meta ml-1 font-normal">({note})</span>}
      </h3>
      {children}
    </section>
  );
}

// Label with a blurred bar: shows a field exists without revealing it.
function LockedField({ label }: { label: string }) {
  return (
    <div>
      <p className="text-meta flex items-center gap-1">
        <Lock className="size-3.5" aria-hidden />
        {label}
      </p>
      <div
        aria-hidden
        className="bg-locked mt-1.5 h-4 w-2/3 rounded-full blur-[6px]"
      />
    </div>
  );
}
