export type CategorySlug =
  "interview-guides" | "resources" | "placement-stories" | "placement-stats";

export type Category = {
  slug: CategorySlug;
  title: string;
  blurb: string;
};

// What a student must do to see the full item (FR-03).
export type Access =
  { kind: "free" } | { kind: "signup" } | { kind: "points"; cost: number };

export type Block =
  | { type: "text"; text: string }
  | { type: "stat"; label: string; value: string };

export type Author = { name: string; tag: string };

export type ContentItem = {
  slug: string;
  category: CategorySlug;
  title: string;
  summary: string;
  author: Author;
  minutes: number;
  access: Access;
  preview: Block[]; // always public
  body: Block[]; // only sent to the browser once unlocked
};

// What the browser receives: the body is replaced by a count when locked.
export type ContentView = Omit<ContentItem, "body"> & {
  body: Block[] | null;
  lockedBlockCount: number;
};

export type Testimonial = { quote: string; name: string; tag: string };
