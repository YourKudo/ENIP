import Link from "next/link";

type Variant = "primary" | "secondary";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-card hover:bg-primary-dark disabled:opacity-50",
  secondary:
    "border-[1.5px] border-primary bg-surface text-subtle hover:bg-chip [&_svg]:text-primary disabled:opacity-50",
};

// Shared by links and real <button>s so both look identical.
export function buttonClasses(variant: Variant = "primary", fullWidth = false) {
  return `rounded-button inline-flex h-[52px] items-center justify-center gap-2 px-5 text-base font-semibold transition-colors duration-200 ${variants[variant]} ${fullWidth ? "w-full" : ""}`;
}

export function ButtonLink({
  href,
  variant = "primary",
  fullWidth = false,
  children,
}: {
  href: string;
  variant?: Variant;
  fullWidth?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={buttonClasses(variant, fullWidth)}>
      {children}
    </Link>
  );
}
