import type { Metadata } from "next";

// Internal pages for the YAL team: kept out of search engines.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function TeamLayout({ children }: LayoutProps<"/team">) {
  return children;
}
