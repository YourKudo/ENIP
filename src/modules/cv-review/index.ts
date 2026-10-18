import "server-only";

import { z } from "zod";

import { db } from "@/adapters/db";
import {
  HireLayerError,
  isHireLayerConfigured,
  reviewResume,
} from "@/adapters/hirelayer";
import { INSTANT_CV_REVIEW_COST } from "@/config/rules";

const requestSchema = z.object({
  idempotencyKey: z.uuid(),
  targetRole: z.string().trim().min(2).max(120),
  jobDescription: z.string().trim().min(20).max(50_000),
});

const MAX_FILE_BYTES = 4_500_000;
const SUPPORTED_EXTENSIONS = new Set([".pdf", ".doc", ".docx", ".rtf", ".txt"]);

export type CvReviewSubmission =
  | { ok: true; reviewId: string; balance?: number }
  | {
      ok: false;
      code: string;
      message: string;
      balance?: number;
      retryable: boolean;
    };

export async function submitInstantReview(
  studentId: string | null,
  guestTokenHash: string | null,
  file: File,
  form: FormData,
): Promise<CvReviewSubmission> {
  const parsed = requestSchema.safeParse({
    idempotencyKey: form.get("idempotencyKey"),
    targetRole: form.get("targetRole"),
    jobDescription: form.get("jobDescription"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      code: "invalid_input",
      message: "Add a target role and a job description to run a review.",
      retryable: true,
    };
  }

  const fileError = await validateResumeFile(file);
  if (fileError) {
    return {
      ok: false,
      code: "invalid_file",
      message: fileError,
      retryable: true,
    };
  }

  const cost = INSTANT_CV_REVIEW_COST;
  if (studentId && cost === null) {
    return {
      ok: false,
      code: "cost_unset",
      message:
        "The ENIP points cost hasn’t been set yet. Instant CV Review is unavailable for now.",
      retryable: false,
    };
  }
  if (!isHireLayerConfigured()) {
    return {
      ok: false,
      code: "provider_unset",
      message:
        "Instant CV Review is not configured yet. Please try again later.",
      retryable: false,
    };
  }

  const targetRole = parsed.data.targetRole;
  const jobText = `Target role: ${targetRole}\n\n${parsed.data.jobDescription}`;
  if (jobText.length > 50_000) {
    return {
      ok: false,
      code: "job_description_too_long",
      message: "Shorten the job description to 50,000 characters or fewer.",
      retryable: true,
    };
  }

  let reviewId: string;
  if (studentId) {
    const reservation = await db.cvReviews.reserve({
      studentId,
      idempotencyKey: parsed.data.idempotencyKey,
      targetRole,
      cost: cost!,
    });
    if (reservation.status === "insufficient") {
      return {
        ok: false,
        code: "insufficient_points",
        message: `This review costs ${cost} points. Your available balance is ${reservation.balance}.`,
        balance: reservation.balance,
        retryable: false,
      };
    }
    if (reservation.status === "completed") {
      const balance = await db.points.balance(studentId);
      return { ok: true, reviewId: reservation.reviewId, balance };
    }
    if (reservation.status === "processing") {
      return {
        ok: false,
        code: "already_processing",
        message: "This review is already running. Please wait a moment.",
        retryable: false,
      };
    }
    if (reservation.status === "failed") {
      return {
        ok: false,
        code: "attempt_failed",
        message: "This attempt has ended. Start a new review to try again.",
        retryable: true,
      };
    }
    reviewId = reservation.reviewId;
  } else {
    if (!guestTokenHash) {
      return {
        ok: false,
        code: "guest_session_required",
        message: "Refresh this page to start your free review.",
        retryable: true,
      };
    }
    const reservation = await db.cvReviews.reserveGuest({
      guestTokenHash,
      idempotencyKey: parsed.data.idempotencyKey,
      targetRole,
    });
    if (reservation.status === "not-found") {
      return {
        ok: false,
        code: "guest_session_required",
        message: "Refresh this page to start your free review.",
        retryable: true,
      };
    }
    if (reservation.status === "completed") {
      return { ok: true, reviewId: reservation.reviewId };
    }
    if (reservation.status === "processing") {
      return {
        ok: false,
        code: "already_processing",
        message: "Your free review is already running. Please wait a moment.",
        retryable: false,
      };
    }
    if (reservation.status === "failed") {
      return {
        ok: false,
        code: "attempt_failed",
        message: "This attempt ended. Submit again to retry your free review.",
        retryable: true,
      };
    }
    reviewId = reservation.reviewId;
  }

  try {
    const result = await reviewResume(file, jobText, reviewId);
    if (studentId) {
      const completed = await db.cvReviews.complete({
        studentId,
        idempotencyKey: parsed.data.idempotencyKey,
        result,
      });
      if (
        completed.status === "completed" ||
        completed.status === "already-completed"
      ) {
        return {
          ok: true,
          reviewId: completed.reviewId,
          balance: completed.balance,
        };
      }
    } else if (guestTokenHash) {
      const completed = await db.cvReviews.completeGuest({
        guestTokenHash,
        idempotencyKey: parsed.data.idempotencyKey,
        result,
      });
      if (
        completed.status === "completed" ||
        completed.status === "already-completed"
      ) {
        return { ok: true, reviewId: completed.reviewId };
      }
    }
    return {
      ok: false,
      code: "attempt_failed",
      message: "We couldn’t save the review. No ENIP points were charged.",
      retryable: true,
    };
  } catch (error) {
    if (studentId) {
      await db.cvReviews.fail({
        studentId,
        idempotencyKey: parsed.data.idempotencyKey,
        errorCode: error instanceof HireLayerError ? error.code : "persistence",
      });
    } else if (guestTokenHash) {
      await db.cvReviews.failGuest({
        guestTokenHash,
        idempotencyKey: parsed.data.idempotencyKey,
        errorCode: error instanceof HireLayerError ? error.code : "persistence",
      });
    }
    return {
      ok: false,
      code: error instanceof HireLayerError ? error.code : "review_failed",
      message: publicErrorMessage(error),
      retryable: true,
    };
  }
}

async function validateResumeFile(file: File): Promise<string | null> {
  if (!file.size) return "Choose a resume file to continue.";
  if (file.size >= MAX_FILE_BYTES) {
    return "Choose a file smaller than 4.5 MB.";
  }
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    return "Use a PDF, DOC, DOCX, RTF, or TXT resume file.";
  }

  const bytes = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const startsWith = (...signature: number[]) =>
    signature.every((byte, index) => bytes[index] === byte);
  const prefix = new TextDecoder().decode(bytes.slice(0, 16));
  const isValid =
    (extension === ".pdf" && prefix.includes("%PDF-")) ||
    (extension === ".docx" && startsWith(0x50, 0x4b, 0x03, 0x04)) ||
    (extension === ".doc" &&
      startsWith(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1)) ||
    (extension === ".rtf" && prefix.startsWith("{\\rtf")) ||
    (extension === ".txt" && isPlainText(bytes));

  return isValid
    ? null
    : "The file contents don’t match its extension. Choose a valid resume file.";
}

function isPlainText(bytes: Uint8Array) {
  if (bytes.includes(0)) return false;
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return true;
  } catch {
    return false;
  }
}

function publicErrorMessage(error: unknown) {
  if (!(error instanceof HireLayerError)) {
    return "We couldn’t complete the review. No ENIP points were charged. Please try again.";
  }
  switch (error.code) {
    case "not_configured":
    case "invalid_key":
      return "Instant CV Review is not configured correctly yet. Please try again later.";
    case "no_credits":
      return "The review provider is temporarily out of credits. This is separate from your ENIP points.";
    case "rate_limited":
      return "The review service is busy. Please try again in a few minutes.";
    case "timeout":
      return "The review took too long to respond. No ENIP points were charged. Please try again.";
    case "no_criteria":
      return "We couldn’t find enough role criteria in that job description to calculate a match.";
    case "unreadable_resume":
      return "We couldn’t read a resume from that file. Try a text-based PDF or DOCX of your resume.";
    case "invalid_response":
    case "unavailable":
      return "The review service is temporarily unavailable. No ENIP points were charged.";
  }
}
