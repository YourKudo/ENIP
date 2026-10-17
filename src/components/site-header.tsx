import Link from "next/link";

import { routes } from "@/lib/routes";
import { ButtonLink } from "./button-link";

const nav = [
  { href: routes.alumni, label: "Alumni" },
  { href: routes.category("interview-guides"), label: "Interview guides" },
  { href: routes.category("resources"), label: "Resources" },
  { href: routes.cvReview, label: "CV review" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href={routes.home} className="text-xl font-bold tracking-tight">
          ENIP
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-slate-900">
              {item.label}
            </Link>
          ))}
        </nav>
        <ButtonLink href={routes.join()}>Join free</ButtonLink>
      </div>
    </header>
  );
}
