import { and, eq, gt, sql } from "drizzle-orm";
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

const { students, pendingSignUps, otpCodes, sessions } = schema;

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
            expiresAt: row.expiresAt.getTime(),
          }
        : null;
    },
    async put({ details, expiresAt }) {
      const values = { details, expiresAt: new Date(expiresAt) };
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
};
