import Link from "next/link";

type Variant = "primary" | "secondary";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white shadow-card hover:bg-primary-dark",
  secondary:
    "border-[1.5px] border-primary bg-surface text-subtle hover:bg-chip [&_svg]:text-primary",
};

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
    <Link
      href={href}
      className={`rounded-button inline-flex h-[52px] items-center justify-center gap-2 px-5 text-base font-semibold transition-colors duration-200 ${variants[variant]} ${fullWidth ? "w-full" : ""}`}
    >
      {children}
    </Link>
  );
}
