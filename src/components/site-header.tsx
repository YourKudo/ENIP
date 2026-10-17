import Link from "next/link";

import { routes } from "@/lib/routes";
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
        <ButtonLink href={routes.join()}>Join</ButtonLink>
      </div>
    </header>
  );
}
