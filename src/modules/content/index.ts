import "server-only";

import { isUnlocked } from "./access";
import {
  categories,
  contentItems,
  platformStats,
  testimonials,
} from "./sample-data";
import type { Category, ContentItem, ContentView } from "./types";

// Pages only call these functions. When the sample data moves to the
// database, only this file changes.

export function getCategories(): Category[] {
  return categories;
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getItemsInCategory(slug: string): ContentView[] {
  return contentItems.filter((i) => i.category === slug).map(toView);
}

export function getItem(
  category: string,
  slug: string,
): ContentView | undefined {
  const item = contentItems.find(
    (i) => i.category === category && i.slug === slug,
  );
  return item && toView(item);
}

export function getAllItemPaths() {
  return contentItems.map((i) => ({ category: i.category, slug: i.slug }));
}

export function getTestimonials() {
  return testimonials;
}

export function getPlatformStats() {
  return platformStats;
}

// Locked bodies never leave the server: the browser only learns how many
// blocks are hidden, so the blur cannot be bypassed with dev tools.
function toView(item: ContentItem): ContentView {
  const unlocked = isUnlocked(item.access);
  return {
    ...item,
    body: unlocked ? item.body : null,
    lockedBlockCount: unlocked ? 0 : item.body.length,
  };
}

export { describeLock } from "./access";
export type * from "./types";
