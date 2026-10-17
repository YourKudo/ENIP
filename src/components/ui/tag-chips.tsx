// Up to `max` rounded chips, then an "N more" line (design spec: 3 chips).
export function TagChips({ tags, max = 3 }: { tags: string[]; max?: number }) {
  const shown = tags.slice(0, max);
  const hidden = tags.length - shown.length;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {shown.map((tag) => (
          <span
            key={tag}
            className="bg-chip text-body max-w-[12rem] truncate rounded-full px-3 py-1 text-sm"
          >
            {tag}
          </span>
        ))}
      </div>
      {hidden > 0 && <p className="text-meta mt-2">{hidden} more</p>}
    </div>
  );
}
