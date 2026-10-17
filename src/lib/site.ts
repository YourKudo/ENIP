import "server-only";

import { headers } from "next/headers";

// The site's public address, e.g. "https://enip.in", used to build links
// people share. SITE_URL wins; otherwise it's taken from the request, so it
// also works on localhost or a tunnel.
export async function siteOrigin(): Promise<string> {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
