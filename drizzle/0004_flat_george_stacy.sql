-- Recreates cv_reviews in its final shape. An early draft of 0003 created a
-- different cv_reviews table on some dev databases (sample data only), so
-- altering it in place fails; on fresh databases this replaces the empty
-- table 0003 just created.
DROP TABLE IF EXISTS "cv_reviews";--> statement-breakpoint
CREATE TABLE "cv_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid,
	"guest_token_hash" text,
	"idempotency_key" text,
	"status" text DEFAULT 'processing' NOT NULL,
	"target_role" text NOT NULL,
	"points_reserved" integer NOT NULL,
	"points_cost" integer NOT NULL,
	"error_code" text,
	"score" real,
	"summary" text,
	"evaluated_criteria" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cv_reviews_guest_token_hash_unique" UNIQUE("guest_token_hash"),
	CONSTRAINT "cv_reviews_student_id_idempotency_key_unique" UNIQUE("student_id","idempotency_key")
);
--> statement-breakpoint
ALTER TABLE "cv_reviews" ADD CONSTRAINT "cv_reviews_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;
