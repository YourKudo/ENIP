import "server-only";

import { z } from "zod";

import type { CvReviewCriterion, CvReviewResult } from "@/adapters/db";

const BASE_URL = "https://hirelayer.co/api";

const parserResponseSchema = z.object({
  status: z.literal("success"),
  request_id: z.string().min(1),
  info_resume: z.object({ text: z.string().trim().min(1) }),
});

// Match v2 writes criteria, summaries and explanations in the job's language,
// so jobs are created with language "en" and results come back in English.
const jobResponseSchema = z.object({
  criteria: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1).max(500),
        requirement: z.enum(["required", "preferred", "bonus"]),
        weight: z.number().int().min(1).max(3),
        threshold: z.string().nullable(),
      }),
    )
    .max(50),
});

const applicationResponseSchema = z.object({
  evaluation_status: z.enum(["pending", "completed", "failed"]),
  score: z.number().min(0).max(1).nullable().optional(),
  summary: z.string().max(5_000).optional(),
  criteria: z
    .array(
      z.object({
        criterion_id: z.string().min(1),
        status: z.enum(["met", "partial", "missing", "unknown"]),
        evidence: z.string().max(3_000),
        explanation: z.string().max(3_000),
      }),
    )
    .max(50)
    .optional(),
});

// v2 statuses mapped onto the stored result's vocabulary.
const statusMap = {
  met: "ideal",
  partial: "potential",
  missing: "not_valid",
  unknown: "not_mentioned",
} as const satisfies Record<string, CvReviewCriterion["matchStatus"]>;

// Every review gets its own job and candidate in this workspace; both are
// deleted as soon as the result is read.
const WORKSPACE = "enip-cv-review";
const EVALUATION_WAIT_MS = 90_000;
const POLL_INTERVAL_MS = 5_000;

type ProviderErrorCode =
  | "not_configured"
  | "invalid_key"
  | "no_credits"
  | "rate_limited"
  | "timeout"
  | "no_criteria"
  | "unreadable_resume"
  | "invalid_response"
  | "unavailable";

export class HireLayerError extends Error {
  constructor(readonly code: ProviderErrorCode) {
    super(code);
    this.name = "HireLayerError";
  }
}

export function isHireLayerConfigured() {
  return Boolean(process.env.HIRELAYER_API_KEY?.trim());
}

export async function reviewResume(
  file: File,
  jobText: string,
  reviewId: string,
): Promise<CvReviewResult> {
  const apiKey = process.env.HIRELAYER_API_KEY?.trim();
  if (!apiKey) throw new HireLayerError("not_configured");

  const jobUrl = `${BASE_URL}/v2/matching/jobs/cvr-${reviewId}`;
  const candidateUrl = `${BASE_URL}/v2/matching/candidates/cvr-${reviewId}`;
  const applicationUrl = `${jobUrl}/applications/cvr-${reviewId}`;
  const headers = {
    "X-API-Key": apiKey,
    "HireLayer-Workspace": WORKSPACE,
    "Content-Type": "application/json",
  };

  try {
    const [candidateText, job] = await Promise.all([
      parseResume(file, apiKey, reviewId),
      requestJson(
        jobUrl,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            description: jobText,
            language: "en",
            status: "closed",
          }),
          signal: AbortSignal.timeout(95_000),
        },
        jobResponseSchema,
      ),
    ]);
    if (job.criteria.length === 0) throw new HireLayerError("no_criteria");

    let application = await requestJson(
      `${applicationUrl}?wait=true`,
      {
        method: "PUT",
        headers,
        // Match accepts up to 50,000 characters; the docs say to truncate.
        body: JSON.stringify({ resume_text: candidateText.slice(0, 50_000) }),
        signal: AbortSignal.timeout(95_000),
      },
      applicationResponseSchema,
    );
    // After 60 seconds HireLayer answers 202 and keeps evaluating.
    const deadline = Date.now() + EVALUATION_WAIT_MS;
    while (application.evaluation_status === "pending") {
      if (Date.now() > deadline) throw new HireLayerError("timeout");
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      application = await requestJson(
        applicationUrl,
        { headers, signal: AbortSignal.timeout(30_000) },
        applicationResponseSchema,
      );
    }
    if (
      application.evaluation_status === "failed" ||
      application.score == null ||
      !application.criteria
    ) {
      throw new HireLayerError("unavailable");
    }

    const results = new Map(
      application.criteria.map((result) => [result.criterion_id, result]),
    );
    return {
      score: application.score,
      summary: application.summary ?? "",
      evaluatedCriteria: job.criteria.map((criterion): CvReviewCriterion => {
        const result = results.get(criterion.id);
        return {
          id: criterion.id,
          label: criterion.label,
          weight: criterion.weight,
          isMandatory: criterion.requirement === "required",
          rationale: "",
          threshold: criterion.threshold ?? undefined,
          matchStatus: statusMap[result?.status ?? "unknown"],
          matchExplanation: result?.explanation ?? "",
          evidence: result?.evidence || undefined,
        };
      }),
    };
  } finally {
    // Free calls; the candidate delete also removes the resume and the
    // evaluation. A failed cleanup must not fail the review.
    await Promise.allSettled(
      [candidateUrl, jobUrl].map((url) =>
        fetch(url, {
          method: "DELETE",
          headers,
          cache: "no-store",
          signal: AbortSignal.timeout(15_000),
        }),
      ),
    );
  }
}

async function parseResume(file: File, apiKey: string, reviewId: string) {
  const form = new FormData();
  form.set("file", file, file.name);
  form.set("application_id", reviewId);
  form.set("do_not_store_data", "true");

  const result = await requestJson(
    `${BASE_URL}/v3/parser`,
    {
      method: "POST",
      headers: { "X-API-Key": apiKey },
      body: form,
      signal: AbortSignal.timeout(150_000),
    },
    parserResponseSchema,
  );
  return result.info_resume.text;
}

async function requestJson<T extends z.ZodType>(
  url: string,
  init: RequestInit,
  schema: T,
): Promise<z.infer<T>> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, cache: "no-store" });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new HireLayerError("timeout");
    }
    throw new HireLayerError("unavailable");
  }

  if (!response.ok) {
    if (response.status === 401) throw new HireLayerError("invalid_key");
    if (response.status === 403) throw new HireLayerError("no_credits");
    if (response.status === 429) throw new HireLayerError("rate_limited");
    // Not a resume, no text, unreadable, or over 100,000 characters.
    if (response.status === 422) throw new HireLayerError("unreadable_resume");
    throw new HireLayerError("unavailable");
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new HireLayerError("invalid_response");
  }
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new HireLayerError("invalid_response");
  return parsed.data;
}
