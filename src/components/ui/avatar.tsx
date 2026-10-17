// 96px lavender rounded square with initials. The spec asks for cartoon
// face illustrations; swap them in here once design shares the assets.
export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  return (
    <div
      className="rounded-avatar bg-avatar text-primary-dark flex size-24 shrink-0 items-center justify-center text-3xl font-bold"
      aria-hidden
    >
      {initials}
    </div>
  );
}
