import { Suspense } from "react";
import Link from "next/link";

import { routes } from "@/lib/routes";
import { getCurrentStudent } from "@/modules/students";
import { ButtonLink } from "./button-link";

const nav = [
  { href: routes.search(), label: "Find people" },
  { href: routes.category("interview-guides"), label: "Interview guides" },
  { href: routes.category("resources"), label: "Resources" },
  { href: routes.cvReview, label: "CV review" },
];

export function SiteHeader() {
  return (
    <header className="border-line bg-bg/90 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href={routes.home}
          className="text-primary text-2xl font-bold tracking-tight"
        >
          ENIP
        </Link>
        <nav className="text-muted hidden items-center gap-6 text-sm font-medium md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {/* Depends on the session cookie, so it streams in on its own and
            the rest of the page can stay static. */}
        <Suspense fallback={<ButtonLink href={routes.join()}>Join</ButtonLink>}>
          <AccountButton />
        </Suspense>
      </div>
    </header>
  );
}

async function AccountButton() {
  const student = await getCurrentStudent();
  if (!student) return <ButtonLink href={routes.join()}>Join</ButtonLink>;
  return (
    <Link
      href={routes.waitlist}
      aria-label={`Your account (${student.name})`}
      className="bg-avatar text-primary-dark flex size-11 items-center justify-center rounded-2xl text-lg font-bold uppercase"
    >
      {student.name[0]}
    </Link>
  );
}
