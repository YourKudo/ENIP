import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Check, PartyPopper } from "lucide-react";

import { signOutAction } from "@/app/join/actions";
import { ButtonLink, buttonClasses } from "@/components/button-link";
import { ShareReferral } from "@/components/growth/share-referral";
import { PageSkeleton } from "@/components/page-skeleton";
import { POINTS_PER_REFERRAL, WAITLIST_MILESTONES } from "@/config/rules";
import { routes } from "@/lib/routes";
import { getGrowthSummary } from "@/modules/growth";
import { getCurrentStudent } from "@/modules/students";

export const metadata: Metadata = { title: "Waitlist" };

// One screen for the whole waitlist journey (UX doc): it updates itself as
// referrals come in instead of showing a new page per milestone.
export default function WaitlistPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Waitlist />
    </Suspense>
  );
}

async function Waitlist() {
  const student = await getCurrentStudent();
  if (!student) redirect(routes.join());

  const g = await getGrowthSummary(student);
  const lastStep = WAITLIST_MILESTONES.at(-1)!.referrals;
  const progress = Math.min(g.successfulReferrals / lastStep, 1);
  const pending = g.invited.filter((f) => f.status === "pending").length;

  return (
    <div className="mx-auto max-w-[480px] space-y-6 px-6 py-10">
      {g.admitted ? (
        <div className="card text-center">
          <PartyPopper className="text-primary mx-auto size-10" aria-hidden />
          <h1 className="text-title mt-3">Congratulations! You&apos;re in.</h1>
          <p className="text-body mt-2">
            You skipped the line, {student.name.split(" ")[0]}. Full access is
            unlocked.
          </p>
          <div className="mt-5">
            <ButtonLink href={routes.search()} fullWidth>
              Explore your network
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-eyebrow">Your network is waiting</p>
          <h1 className="text-title mt-1">
            You&apos;re #{g.position ?? "–"} in line
          </h1>
          <p className="text-meta mt-1">
            {g.waitingCount} {g.waitingCount === 1 ? "person" : "people"} on the
            waitlist
          </p>
        </div>
      )}

      {!g.admitted && (
        <section className="card">
          <p className="text-ink font-bold">
            {g.nextMilestone
              ? `Refer ${g.nextMilestone.remaining} more ${g.nextMilestone.remaining === 1 ? "student" : "students"} to ${g.nextMilestone.skip ? "skip the line" : `move up ${g.nextMilestone.moveUp} places`}.`
              : "You've reached every milestone."}
          </p>
          <div
            className="bg-chip mt-4 h-2.5 overflow-hidden rounded-full"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={lastStep}
            aria-valuenow={g.successfulReferrals}
            aria-label="Referral progress"
          >
            <div
              className="bg-primary h-full rounded-full transition-[width] duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <ol className="mt-4 space-y-2">
            {WAITLIST_MILESTONES.map((m) => {
              const done = g.successfulReferrals >= m.referrals;
              return (
                <li key={m.referrals} className="flex items-center gap-3">
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${done ? "bg-primary text-white" : "bg-chip text-primary"}`}
                  >
                    {done ? (
                      <Check className="size-4" aria-hidden />
                    ) : (
                      m.referrals
                    )}
                  </span>
                  <span
                    className={done ? "text-ink font-semibold" : "text-body"}
                  >
                    {m.referrals} {m.referrals === 1 ? "friend" : "friends"} ·{" "}
                    {m.skip ? "skip the line" : `move up ${m.moveUp} places`}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <ShareReferral link={g.referralLink} code={g.referralCode} />

      <dl className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Joined", value: g.successfulReferrals },
          { label: "Pending", value: pending },
          { label: "Points", value: g.points },
        ].map((s) => (
          <div key={s.label} className="card flex flex-col-reverse px-3 py-4">
            <dt className="text-meta">{s.label}</dt>
            <dd className="text-ink text-2xl font-bold">{s.value}</dd>
          </div>
        ))}
      </dl>

      <section>
        <h2 className="text-ink mb-2 font-bold">Friends you invited</h2>
        {g.invited.length === 0 ? (
          <p className="card text-meta text-center">
            No one yet. Share your link to get started.
          </p>
        ) : (
          <ul className="card divide-line divide-y py-2">
            {g.invited.map((f, i) => (
              <li
                key={`${f.firstName}-${i}`}
                className="flex items-center justify-between py-3"
              >
                <span className="text-ink font-medium">{f.firstName}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${f.status === "successful" ? "bg-alumni/10 text-alumni" : "bg-chip text-muted"}`}
                >
                  {f.status === "successful" ? "Joined" : "Pending"}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-meta mt-3">
          A friend counts once they verify their IIT email. Each one earns you{" "}
          {POINTS_PER_REFERRAL} points.
        </p>
      </section>

      <div className="flex flex-col gap-3">
        <ButtonLink href={routes.search()} variant="secondary" fullWidth>
          Find someone to talk to
        </ButtonLink>
        <form action={signOutAction}>
          <button type="submit" className={buttonClasses("secondary", true)}>
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
