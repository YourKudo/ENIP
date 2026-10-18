import { Suspense } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { routes } from "@/lib/routes";
import { getCurrentStudent } from "@/modules/students";
import { ButtonLink } from "./button-link";

const nav = [
  { href: routes.search(), label: "Alum Chat" },
  { href: routes.cvReview, label: "CV Review" },
  { href: routes.category("resources"), label: "Resources" },
];

export function SiteHeader() {
  return (
    <header className="site-header border-line border-b bg-white">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href={routes.home}
          className="text-primary text-[25px] font-bold tracking-[-0.06em]"
          aria-label="ENIP home"
        >
          ENIP<span className="text-primary-soft">.</span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="text-subtle hidden items-center gap-7 text-sm font-medium md:flex"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="site-nav-link hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Suspense fallback={<HeaderActions />}>
            <AccountActions />
          </Suspense>
        </div>

        <details className="site-mobile-menu relative md:hidden">
          <summary className="text-primary border-line-strong focus-visible:outline-primary flex size-11 cursor-pointer list-none items-center justify-center rounded-full border focus-visible:outline-2 focus-visible:outline-offset-2">
            <Menu size={21} aria-hidden />
            <span className="sr-only">Open navigation menu</span>
          </summary>
          <nav
            aria-label="Mobile navigation"
            className="border-line absolute top-[calc(100%+12px)] right-0 z-40 flex w-64 flex-col rounded-2xl border bg-white p-3 shadow-xl"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="site-mobile-nav-link rounded-xl px-4 py-3 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
            <div className="border-line mt-2 grid gap-2 border-t p-2 pt-3">
              <Link className="site-mobile-auth-link" href={routes.signIn()}>
                Log in
              </Link>
              <ButtonLink href={routes.join()} fullWidth>
                Sign up
              </ButtonLink>
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}

async function AccountActions() {
  const student = await getCurrentStudent();
  if (!student) return <HeaderActions />;
  return (
    <Link
      href={routes.waitlist}
      aria-label={`Your account (${student.name})`}
      className="bg-avatar text-primary-dark flex size-10 items-center justify-center rounded-full text-sm font-bold uppercase"
    >
      {student.name[0]}
    </Link>
  );
}

function HeaderActions() {
  return (
    <>
      <Link
        href={routes.signIn()}
        className="site-login-link text-sm font-semibold"
      >
        Log in
      </Link>
      <ButtonLink href={routes.join()}>Sign up</ButtonLink>
    </>
  );
}
