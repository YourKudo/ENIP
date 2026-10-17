import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// The web's Postgres tables, as described in docs/INTEGRATION.md. Change a
// table here, then run `npm run db:generate` and `npm run db:migrate`.

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Identity from the sign-in provider (local OTP: the verified email).
  authUserId: text("auth_user_id").notNull().unique(),
  // Set in phase 2 when linked to the ENIP app user.
  appUserId: text("app_user_id").unique(),
  email: text("email").notNull().unique(),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  name: text("name").notNull(),
  iitId: text("iit_id").notNull(),
  graduationYear: integer("graduation_year").notNull(),
  phone: text("phone").notNull().unique(),
  whatsappConsent: boolean("whatsapp_consent").notNull().default(false),
  whatsappConsentAt: timestamp("whatsapp_consent_at", { withTimezone: true }),
  referralCode: text("referral_code").notNull().unique(),
  role: text("role").notNull().default("student"), // "student" | "mentor"
  createdAt: createdAt(),
});

// Form details held between the sign-up form and the OTP check.
export const pendingSignUps = pgTable("pending_sign_ups", {
  email: text("email").primaryKey(),
  details: jsonb("details").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const otpCodes = pgTable("otp_codes", {
  email: text("email").primaryKey(),
  codeHash: text("code_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  attempts: integer("attempts").notNull().default(0),
  sentAt: timestamp("sent_at", { withTimezone: true }).array().notNull(),
});

export const sessions = pgTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: text("user_id").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// Phase 1: the YAL team / EIRs / volunteer alumni shown as seniors.
export const mentors = pgTable("mentors", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id").references(() => students.id), // login for /team
  appUserId: text("app_user_id"),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  institute: text("institute").notNull(),
  branch: text("branch").notNull(),
  batch: integer("batch").notNull(),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  helpWith: text("help_with").notNull(),
  topics: text("topics").array().notNull(),
  // FR-18: team members are never labelled "alumni" unless they are.
  memberType: text("member_type").notNull(), // alumni|founder|yal-team|eir
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
});

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id),
    mentorId: uuid("mentor_id")
      .notNull()
      .references(() => mentors.id),
    appConversationId: text("app_conversation_id"),
    createdAt: createdAt(),
  },
  (t) => [unique().on(t.studentId, t.mentorId)],
);

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id),
  sender: text("sender").notNull(), // "student" | "mentor"
  kind: text("kind").notNull(), // "text" | "cv"
  body: text("body").notNull(),
  attachmentUrl: text("attachment_url"),
  appMessageId: text("app_message_id"),
  createdAt: createdAt(),
});

export const waitlistEntries = pgTable("waitlist_entries", {
  studentId: uuid("student_id")
    .primaryKey()
    .references(() => students.id),
  joinedAt: timestamp("joined_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  bonusPositions: integer("bonus_positions").notNull().default(0),
  status: text("status").notNull().default("waiting"), // waiting | admitted
  admittedAt: timestamp("admitted_at", { withTimezone: true }),
});

export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().defaultRandom(),
  referrerId: uuid("referrer_id")
    .notNull()
    .references(() => students.id),
  // A student can be referred only once.
  refereeId: uuid("referee_id")
    .notNull()
    .unique()
    .references(() => students.id),
  codeUsed: text("code_used").notNull(),
  status: text("status").notNull().default("pending"), // pending|successful|ineligible
  ineligibleReason: text("ineligible_reason"),
  createdAt: createdAt(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
});

// Balance = sum(delta). The unique key stops the same reward twice.
export const pointsLedger = pgTable(
  "points_ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id),
    delta: integer("delta").notNull(),
    reason: text("reason").notNull(),
    refId: text("ref_id").notNull(),
    createdAt: createdAt(),
  },
  (t) => [unique().on(t.reason, t.refId)],
);

export const unlocks = pgTable(
  "unlocks",
  {
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id),
    itemType: text("item_type").notNull(), // "resource" | "chat"
    itemId: text("item_id").notNull(),
    pointsSpent: integer("points_spent").notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.studentId, t.itemType, t.itemId] })],
);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id),
  channel: text("channel").notNull(), // "whatsapp"
  template: text("template").notNull(),
  payload: jsonb("payload").notNull(),
  status: text("status").notNull().default("queued"), // queued|sent|failed
  providerMessageId: text("provider_message_id"),
  error: text("error"),
  createdAt: createdAt(),
});
