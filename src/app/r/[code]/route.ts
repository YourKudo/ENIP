import { NextResponse } from "next/server";

import { routes } from "@/lib/routes";
import { rememberReferral } from "@/modules/growth";

// The link people share: /r/ROHA47. Remembers the code in this browser
// (if it exists), then opens the home page so the friend can explore first.
export async function GET(request: Request, ctx: RouteContext<"/r/[code]">) {
  const { code } = await ctx.params;
  await rememberReferral(code);
  return NextResponse.redirect(new URL(routes.home, request.url));
}
