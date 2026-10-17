// 96px lavender rounded square. Shows the photo or avatar the member set in
// the app; falls back to initials when they have none.
export function Avatar({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string | null;
}) {
  if (imageUrl) {
    return (
      // Plain <img>: avatar URLs come from the app's storage, whose host
      // isn't known yet for next/image's allow-list.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className="rounded-avatar bg-avatar size-24 shrink-0 object-cover"
      />
    );
  }
  return (
    <div
      className="rounded-avatar bg-avatar text-primary-dark flex size-24 shrink-0 items-center justify-center text-3xl font-bold uppercase"
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

// "Rohan Mehta" -> "RM", "@civil2code" -> "CI".
function initials(name: string) {
  const words = name.replace(/^@/, "").split(/[\s_]+/);
  return words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2);
}
