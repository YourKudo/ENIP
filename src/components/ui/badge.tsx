import { GraduationCap, Rocket, Sparkles, type LucideIcon } from "lucide-react";

import type { MemberType } from "@/adapters/enip-app";

type Tone = "primary" | "founder" | "alumni" | "muted";

const tones: Record<Tone, string> = {
  primary: "border-primary text-primary",
  founder: "border-founder text-founder",
  alumni: "border-alumni text-alumni",
  muted: "border-line-strong text-muted",
};

// Fully rounded, 1.5px outline, icon + label.
export function Badge({
  tone,
  icon: Icon,
  children,
}: {
  tone: Tone;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`bg-surface inline-flex shrink-0 items-center gap-1 rounded-full border-[1.5px] px-2.5 py-0.5 text-[13px] font-semibold ${tones[tone]}`}
    >
      {Icon && <Icon className="size-3.5" strokeWidth={2} aria-hidden />}
      {children}
    </span>
  );
}

const memberBadges: Record<
  MemberType,
  { tone: Tone; icon: LucideIcon; label: string }
> = {
  alumni: { tone: "alumni", icon: GraduationCap, label: "Alumni" },
  founder: { tone: "founder", icon: Rocket, label: "Founder" },
  "yal-team": { tone: "primary", icon: Sparkles, label: "YAL Team" },
  eir: { tone: "primary", icon: Sparkles, label: "EIR" },
};

export function MemberBadge({ type }: { type: MemberType }) {
  const { tone, icon, label } = memberBadges[type];
  return (
    <Badge tone={tone} icon={icon}>
      {label}
    </Badge>
  );
}
