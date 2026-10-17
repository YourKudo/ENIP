import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signInAction } from "@/app/join/actions";
import { SignInForm } from "@/components/onboarding/sign-in-form";
import { PageSkeleton } from "@/components/page-skeleton";
import { routes, safeReturnPath } from "@/lib/routes";
import { getCurrentStudent } from "@/modules/students";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage(props: PageProps<"/signin">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SignIn {...props} />
    </Suspense>
  );
}

async function SignIn({ searchParams }: PageProps<"/signin">) {
  const next = safeReturnPath((await searchParams).next, "");
  if (await getCurrentStudent()) redirect(next || routes.waitlist);

  return (
    <div className="mx-auto max-w-[480px] px-6 py-10">
      <p className="text-eyebrow">Welcome back</p>
      <h1 className="text-title mt-1">Sign in</h1>
      <p className="text-body mt-2">
        We&apos;ll email a code to the IIT address you joined with.
      </p>
      <SignInForm action={signInAction} next={next} />
      <p className="text-meta mt-6 text-center">
        New here?{" "}
        <Link
          href={routes.join(next || undefined)}
          className="text-primary font-semibold hover:underline"
        >
          Join
        </Link>
      </p>
    </div>
  );
}
