// Every internal URL is built here, so renaming a route is a one-file change.

export const routes = {
  home: "/",
  cvReview: "/cv-review",
  referrals: "/referrals",
  rewards: "/rewards",
  category: (category: string) => `/explore/${category}`,
  content: (category: string, slug: string) => `/explore/${category}/${slug}`,
  // Empty query lists everyone. `profile` opens that person's detail sheet.
  search: (query = "", profileId?: string) =>
    withParams("/search", { q: query, profile: profileId }),
  // `from` is where the back button returns, e.g. the search results.
  chat: (alumniId: string, from?: string) =>
    withParams(`/chat/${alumniId}`, { from }),
  // `next` brings the student back to where they were after signing up
  // (FR-10). Without it they land on the waitlist.
  join: (next?: string) => withParams("/join", { next }),
};

// Only same-site paths are accepted as return targets, so a crafted link
// can't send students to another website.
export function safeReturnPath(value: unknown, fallback: string): string {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\")
    ? value
    : fallback;
}

function withParams(path: string, params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}
