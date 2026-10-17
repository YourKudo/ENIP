// "How did you hear about us?" options on the sign-up form. The id is
// stored; the label is shown. Add or reword freely, keep ids stable.

export const HEARD_FROM_OPTIONS = [
  { id: "friend", label: "A friend shared a link or code" },
  { id: "whatsapp", label: "WhatsApp group" },
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "senior", label: "A senior or alum" },
  { id: "campus", label: "College club or event" },
  { id: "other", label: "Other" },
] as const;

export type HeardFrom = (typeof HEARD_FROM_OPTIONS)[number]["id"];

export function isHeardFrom(value: string): value is HeardFrom {
  return HEARD_FROM_OPTIONS.some((o) => o.id === value);
}
