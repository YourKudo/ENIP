import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// 56px white circle with a soft shadow and a plum chevron.
export function BackButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="bg-surface text-primary shadow-card flex size-14 shrink-0 items-center justify-center rounded-full"
    >
      <ChevronLeft className="size-7" strokeWidth={2} aria-hidden />
    </Link>
  );
}
