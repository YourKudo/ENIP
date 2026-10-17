const sizes = {
  md: "size-14 text-xl rounded-2xl",
  lg: "size-24 text-3xl rounded-avatar",
};

// Lavender rounded square. Shows the photo or avatar the member set in the
// app; falls back to initials when they have none.
export function Avatar({
  name,
  imageUrl,
  size = "lg",
}: {
  name: string;
  imageUrl: string | null;
  size?: keyof typeof sizes;
}) {
  if (imageUrl) {
    return (
      // Plain <img>: avatar URLs come from the app's storage, whose host
      // isn't known yet for next/image's allow-list.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className={`bg-avatar shrink-0 object-cover ${sizes[size]}`}
      />
    );
  }
  return (
    <div
      className={`bg-avatar text-primary-dark flex shrink-0 items-center justify-center font-bold uppercase ${sizes[size]}`}
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
