// Every internal URL is built here, so renaming a route is a one-file change.

export const routes = {
  home: "/",
  alumni: "/alumni",
  cvReview: "/cv-review",
  chat: (alumniId: string) => `/chat/${alumniId}`,
  referrals: "/referrals",
  rewards: "/rewards",
  category: (category: string) => `/explore/${category}`,
  content: (category: string, slug: string) => `/explore/${category}/${slug}`,
  // `next` brings the student back to where they were after signing up (FR-10).
  join: (next?: string) =>
    next ? `/join?next=${encodeURIComponent(next)}` : "/join",
};
