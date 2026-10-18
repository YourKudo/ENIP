import { and, asc, count, desc, eq, gt, sql, sum } from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import type {
  Db,
  MentorRecord,
  MessageRecord,
  StudentDetails,
  StudentRecord,
} from "./index";
import * as schema from "./schema";

// Postgres via Drizzle. Works with Neon, Supabase or any Postgres: only
// DATABASE_URL changes. The connection opens on first use.

type Orm = PostgresJsDatabase<typeof schema>;

// One connection pool per server process (also across dev hot reloads).
function orm(): Orm {
  const holder = globalThis as { __enipOrm?: Orm };
  if (!holder.__enipOrm) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is missing in .env.local");
    // prepare: false keeps it compatible with poolers such as Neon's.
    holder.__enipOrm = drizzle(postgres(url, { max: 5, prepare: false }), {
      schema,
    });
  }
  return holder.__enipOrm;
}

const {
  students,
  pendingSignUps,
  otpCodes,
  sessions,
  waitlistEntries,
  referrals,
  pointsLedger,
  mentors,
  conversations,
  messages,
} = schema;

// Ids in URLs are user input. Anything that isn't a uuid can't match a row
// (and would make Postgres throw), so those lookups return early.
const isUuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

function toMentor(row: typeof mentors.$inferSelect): MentorRecord {
  return {
    id: row.id,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    institute: row.institute,
    branch: row.branch,
    batch: row.batch,
    jobTitle: row.jobTitle,
    company: row.company,
    helpWith: row.helpWith,
    topics: row.topics,
    memberType: row.memberType,
  };
}

function toMessage(row: typeof messages.$inferSelect): MessageRecord {
  return {
    id: row.id,
    sender: row.sender as MessageRecord["sender"],
    kind: row.kind as MessageRecord["kind"],
    body: row.body,
    sentBy: row.sentBy,
    createdAt: row.createdAt.getTime(),
  };
}

function toStudent(row: typeof students.$inferSelect): StudentRecord {
  return {
    id: row.id,
    authUserId: row.authUserId,
    name: row.name,
    iitId: row.iitId,
    graduationYear: row.graduationYear,
    email: row.email,
    phone: row.phone,
    whatsappConsent: row.whatsappConsent,
    whatsappConsentAt: row.whatsappConsentAt?.toISOString() ?? null,
    heardFrom: row.heardFrom,
    referralCode: row.referralCode,
    createdAt: row.createdAt.toISOString(),
  };
}

async function findStudent(where: ReturnType<typeof eq>) {
  const [row] = await orm().select().from(students).where(where).limit(1);
  return row ? toStudent(row) : null;
}

export const postgresDb: Db = {
  students: {
    findById: (id) => findStudent(eq(students.id, id)),
    findByAuthUserId: (authUserId) =>
      findStudent(eq(students.authUserId, authUserId)),
    findByEmail: (email) => findStudent(eq(students.email, email)),
    findByPhone: (phone) => findStudent(eq(students.phone, phone)),
    findByReferralCode: (code) => findStudent(eq(students.referralCode, code)),
    async insert(student) {
      const createdAt = new Date(student.createdAt);
      await orm()
        .insert(students)
        .values({
          ...student,
          whatsappConsentAt: student.whatsappConsentAt
            ? new Date(student.whatsappConsentAt)
            : null,
          emailVerifiedAt: createdAt, // students are created on verification
          createdAt,
        });
    },
    async setAuthUserId(id, authUserId) {
      await orm()
        .update(students)
        .set({ authUserId })
        .where(eq(students.id, id));
    },
  },

  pendingSignUps: {
    async get(email) {
      const [row] = await orm()
        .select()
        .from(pendingSignUps)
        .where(
          and(
            eq(pendingSignUps.email, email),
            gt(pendingSignUps.expiresAt, new Date()),
          ),
        )
        .limit(1);
      return row
        ? {
            details: row.details as StudentDetails,
            referralCode: row.referralCode,
            expiresAt: row.expiresAt.getTime(),
          }
        : null;
    },
    async put({ details, referralCode, expiresAt }) {
      const values = {
        details,
        referralCode,
        expiresAt: new Date(expiresAt),
      };
      await orm()
        .insert(pendingSignUps)
        .values({ email: details.email, ...values })
        .onConflictDoUpdate({ target: pendingSignUps.email, set: values });
    },
    async delete(email) {
      await orm().delete(pendingSignUps).where(eq(pendingSignUps.email, email));
    },
  },

  otpCodes: {
    async get(email) {
      const [row] = await orm()
        .select()
        .from(otpCodes)
        .where(eq(otpCodes.email, email))
        .limit(1);
      return row
        ? {
            email: row.email,
            codeHash: row.codeHash,
            expiresAt: row.expiresAt.getTime(),
            attempts: row.attempts,
            sentAt: row.sentAt.map((d) => d.getTime()),
          }
        : null;
    },
    async put(code) {
      const values = {
        codeHash: code.codeHash,
        expiresAt: new Date(code.expiresAt),
        attempts: code.attempts,
        sentAt: code.sentAt.map((t) => new Date(t)),
      };
      await orm()
        .insert(otpCodes)
        .values({ email: code.email, ...values })
        .onConflictDoUpdate({ target: otpCodes.email, set: values });
    },
    async addFailedAttempt(email) {
      await orm()
        .update(otpCodes)
        .set({ attempts: sql`${otpCodes.attempts} + 1` })
        .where(eq(otpCodes.email, email));
    },
    async delete(email) {
      await orm().delete(otpCodes).where(eq(otpCodes.email, email));
    },
  },

  sessions: {
    async get(tokenHash) {
      const [row] = await orm()
        .select()
        .from(sessions)
        .where(eq(sessions.tokenHash, tokenHash))
        .limit(1);
      return row
        ? {
            tokenHash: row.tokenHash,
            userId: row.userId,
            expiresAt: row.expiresAt.getTime(),
          }
        : null;
    },
    async put(session) {
      await orm()
        .insert(sessions)
        .values({ ...session, expiresAt: new Date(session.expiresAt) });
    },
    async delete(tokenHash) {
      await orm().delete(sessions).where(eq(sessions.tokenHash, tokenHash));
    },
  },

  waitlist: {
    async join(studentId) {
      await orm()
        .insert(waitlistEntries)
        .values({ studentId })
        .onConflictDoNothing();
    },
    async get(studentId) {
      const [row] = await orm()
        .select()
        .from(waitlistEntries)
        .where(eq(waitlistEntries.studentId, studentId))
        .limit(1);
      return row
        ? {
            studentId: row.studentId,
            joinedAt: row.joinedAt.getTime(),
            bonusPositions: row.bonusPositions,
            admitted: row.status === "admitted",
          }
        : null;
    },
    // Place = order of joining, minus the places earned by referrals.
    // Ties go to whoever joined first. Computed, never stored, so it is
    // always consistent.
    async position(studentId) {
      const rows = await orm().execute<{ position: number }>(sql`
        with ranked as (
          select student_id, joined_at,
                 row_number() over (order by joined_at) - bonus_positions as score
          from ${waitlistEntries}
          where status = 'waiting'
        )
        select (
          select count(*) from ranked r2
          where r2.score < r1.score
             or (r2.score = r1.score and r2.joined_at < r1.joined_at)
        )::int + 1 as position
        from ranked r1
        where r1.student_id = ${studentId}
      `);
      return rows[0]?.position ?? null;
    },
    async waitingCount() {
      const [row] = await orm()
        .select({ n: count() })
        .from(waitlistEntries)
        .where(eq(waitlistEntries.status, "waiting"));
      return row?.n ?? 0;
    },
    async setProgress(studentId, bonusPositions, admitted) {
      await orm()
        .update(waitlistEntries)
        .set({
          bonusPositions,
          status: admitted ? "admitted" : "waiting",
          admittedAt: admitted ? sql`coalesce(admitted_at, now())` : null,
        })
        .where(eq(waitlistEntries.studentId, studentId));
    },
  },

  referrals: {
    async addSuccessful({ referrerId, refereeId, codeUsed }) {
      const inserted = await orm()
        .insert(referrals)
        .values({
          referrerId,
          refereeId,
          codeUsed,
          status: "successful",
          verifiedAt: new Date(),
        })
        .onConflictDoNothing({ target: referrals.refereeId })
        .returning({ id: referrals.id });
      if (inserted[0]) return { id: inserted[0].id, created: true };
      const [existing] = await orm()
        .select({ id: referrals.id })
        .from(referrals)
        .where(eq(referrals.refereeId, refereeId));
      return { id: existing.id, created: false };
    },
    async countSuccessful(referrerId) {
      const [row] = await orm()
        .select({ n: count() })
        .from(referrals)
        .where(
          and(
            eq(referrals.referrerId, referrerId),
            eq(referrals.status, "successful"),
          ),
        );
      return row?.n ?? 0;
    },
    async listInvited(referrerId, code) {
      const done = await orm()
        .select({ name: students.name, at: referrals.createdAt })
        .from(referrals)
        .innerJoin(students, eq(students.id, referrals.refereeId))
        .where(eq(referrals.referrerId, referrerId))
        .orderBy(desc(referrals.createdAt));
      const waiting = await orm()
        .select({ details: pendingSignUps.details })
        .from(pendingSignUps)
        .where(
          and(
            eq(pendingSignUps.referralCode, code),
            gt(pendingSignUps.expiresAt, new Date()),
          ),
        );
      const firstName = (name: string) => name.split(" ")[0];
      return [
        ...waiting.map(({ details }) => ({
          firstName: firstName((details as StudentDetails).name),
          status: "pending" as const,
          at: Date.now(),
        })),
        ...done.map((r) => ({
          firstName: firstName(r.name),
          status: "successful" as const,
          at: r.at.getTime(),
        })),
      ];
    },
  },

  mentors: {
    async listActive() {
      const rows = await orm()
        .select()
        .from(mentors)
        .where(eq(mentors.isActive, true))
        .orderBy(asc(mentors.createdAt));
      return rows.map(toMentor);
    },
    async get(id) {
      if (!isUuid(id)) return null;
      const [row] = await orm()
        .select()
        .from(mentors)
        .where(and(eq(mentors.id, id), eq(mentors.isActive, true)))
        .limit(1);
      return row ? toMentor(row) : null;
    },
  },

  conversations: {
    async get(id) {
      if (!isUuid(id)) return null;
      const [row] = await orm()
        .select({
          id: conversations.id,
          studentId: conversations.studentId,
          mentorId: conversations.mentorId,
        })
        .from(conversations)
        .where(eq(conversations.id, id))
        .limit(1);
      return row ?? null;
    },
    async mentorIdsFor(studentId) {
      const rows = await orm()
        .select({ mentorId: conversations.mentorId })
        .from(conversations)
        .where(eq(conversations.studentId, studentId));
      return rows.map((r) => r.mentorId);
    },
    // One query: every conversation with its latest message.
    async listInbox() {
      const rows = await orm().execute<{
        conversation_id: string;
        student_name: string;
        student_iit_id: string;
        mentor_name: string;
        message_count: number;
        sender: MessageRecord["sender"];
        kind: MessageRecord["kind"];
        body: string;
        created_at: string;
      }>(sql`
        select c.id as conversation_id, s.name as student_name,
               s.iit_id as student_iit_id, m.display_name as mentor_name,
               last.message_count, last.sender, last.kind, last.body,
               last.created_at
        from ${conversations} c
        join ${students} s on s.id = c.student_id
        join ${mentors} m on m.id = c.mentor_id
        join lateral (
          select sender, kind, body, created_at,
                 count(*) over ()::int as message_count
          from ${messages}
          where conversation_id = c.id
          order by created_at desc
          limit 1
        ) last on true
        order by last.created_at desc
      `);
      return rows.map((r) => ({
        conversationId: r.conversation_id,
        studentName: r.student_name,
        studentIitId: r.student_iit_id,
        mentorName: r.mentor_name,
        messageCount: r.message_count,
        lastMessage: {
          sender: r.sender,
          kind: r.kind,
          body: r.body,
          createdAt: new Date(r.created_at).getTime(),
        },
      }));
    },
  },

  messages: {
    async list(conversationId) {
      if (!isUuid(conversationId)) return [];
      const rows = await orm()
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(asc(messages.createdAt));
      return rows.map(toMessage);
    },
    async listBetween(studentId, mentorId) {
      if (!isUuid(mentorId)) return [];
      const rows = await orm()
        .select({ message: messages })
        .from(messages)
        .innerJoin(conversations, eq(conversations.id, messages.conversationId))
        .where(
          and(
            eq(conversations.studentId, studentId),
            eq(conversations.mentorId, mentorId),
          ),
        )
        .orderBy(asc(messages.createdAt));
      return rows.map((r) => toMessage(r.message));
    },
    async addFromStudent({ studentId, mentorId, kind, body }) {
      // The no-op update makes the upsert return the existing row's id.
      const [conversation] = await orm()
        .insert(conversations)
        .values({ studentId, mentorId })
        .onConflictDoUpdate({
          target: [conversations.studentId, conversations.mentorId],
          set: { studentId },
        })
        .returning({ id: conversations.id });
      const [row] = await orm()
        .insert(messages)
        .values({
          conversationId: conversation.id,
          sender: "student",
          kind,
          body,
        })
        .returning();
      return toMessage(row);
    },
    async addFromMentor({ conversationId, body, sentBy }) {
      const [row] = await orm()
        .insert(messages)
        .values({
          conversationId,
          sender: "mentor",
          kind: "text",
          body,
          sentBy,
        })
        .returning();
      return toMessage(row);
    },
  },

  points: {
    async award({ studentId, delta, reason, refId }) {
      await orm()
        .insert(pointsLedger)
        .values({ studentId, delta, reason, refId })
        .onConflictDoNothing({
          target: [pointsLedger.reason, pointsLedger.refId],
        });
    },
    async balance(studentId) {
      const [row] = await orm()
        .select({ total: sum(pointsLedger.delta) })
        .from(pointsLedger)
        .where(eq(pointsLedger.studentId, studentId));
      return Number(row?.total ?? 0);
    },
  },
};
