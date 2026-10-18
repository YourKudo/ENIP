CREATE TABLE "cv_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"idempotency_key" text NOT NULL,
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
	CONSTRAINT "cv_reviews_student_id_idempotency_key_unique" UNIQUE("student_id","idempotency_key")
);
--> statement-breakpoint
ALTER TABLE "cv_reviews" ADD CONSTRAINT "cv_reviews_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;