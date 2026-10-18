import { NextResponse } from "next/server";

import { getCurrentStudent } from "@/modules/students";
import {
  hashGuestCvReviewToken,
  readGuestCvReviewToken,
} from "@/modules/cv-review/guest-session";
import { submitInstantReview } from "@/modules/cv-review";

export const maxDuration = 240;

const MAX_REQUEST_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  let sameOrigin = false;
  try {
    sameOrigin = Boolean(
      origin && new URL(origin).origin === new URL(request.url).origin,
    );
  } catch {
    sameOrigin = false;
  }
  if (!sameOrigin) {
    return NextResponse.json(
      { ok: false, code: "invalid_origin", message: "Request not allowed." },
      { status: 403 },
    );
  }

  const student = await getCurrentStudent();
  const guestToken = student ? null : await readGuestCvReviewToken();
  if (!student && !guestToken) {
    return NextResponse.json(
      {
        ok: false,
        code: "guest_session_required",
        message: "Refresh this page to start your free review.",
        retryable: true,
      },
      { status: 401 },
    );
  }

  let form: FormData;
  try {
    const body = await readBoundedBody(request);
    form = await new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body,
    }).formData();
  } catch (error) {
    const tooLarge =
      error instanceof Error && error.message === "request_too_large";
    return NextResponse.json(
      {
        ok: false,
        code: tooLarge ? "request_too_large" : "invalid_input",
        message: tooLarge
          ? "Choose a resume file smaller than 4.5 MB."
          : "Choose a resume and complete the review details.",
        retryable: true,
      },
      { status: tooLarge ? 413 : 400 },
    );
  }

  const file = form.get("resume");
  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        ok: false,
        code: "invalid_file",
        message: "Choose a resume file to continue.",
        retryable: true,
      },
      { status: 400 },
    );
  }

  const result = await submitInstantReview(
    student?.id ?? null,
    guestToken ? hashGuestCvReviewToken(guestToken) : null,
    file,
    form,
  );
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}

async function readBoundedBody(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) throw new Error("request_too_large");
  if (!request.body) throw new Error("missing_body");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_REQUEST_BYTES) {
      await reader.cancel();
      throw new Error("request_too_large");
    }
    chunks.push(value);
  }

  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}
