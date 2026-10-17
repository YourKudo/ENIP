import { and, count, desc, eq, gt, sql, sum } from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import type { Db, StudentDetails, StudentRecord } from "./index";
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
} = schema;

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
