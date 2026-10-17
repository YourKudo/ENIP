import type { Db, PendingSignUp, StudentRecord } from "./index";

// DEV ONLY: records live in memory and reset when the server restarts.

type Tables = {
  students: Map<string, StudentRecord>;
  pending: Map<string, PendingSignUp>;
};

// Kept on globalThis so data survives the dev server's hot reloads.
const tables: Tables = ((globalThis as { __enipDb?: Tables }).__enipDb ??= {
  students: new Map(),
  pending: new Map(),
});

function findStudent(match: (s: StudentRecord) => boolean) {
  for (const s of tables.students.values()) if (match(s)) return s;
  return null;
}

export const memoryDb: Db = {
  students: {
    async findById(id) {
      return tables.students.get(id) ?? null;
    },
    async findByAuthUserId(authUserId) {
      return findStudent((s) => s.authUserId === authUserId);
    },
    async findByEmail(email) {
      return findStudent((s) => s.email === email);
    },
    async findByPhone(phone) {
      return findStudent((s) => s.phone === phone);
    },
    async findByReferralCode(code) {
      return findStudent((s) => s.referralCode === code);
    },
    async insert(student) {
      tables.students.set(student.id, student);
    },
    async setAuthUserId(id, authUserId) {
      const student = tables.students.get(id);
      if (student) tables.students.set(id, { ...student, authUserId });
    },
  },
  pendingSignUps: {
    async get(email) {
      const pending = tables.pending.get(email);
      return pending && pending.expiresAt > Date.now() ? pending : null;
    },
    async put(pending) {
      tables.pending.set(pending.details.email, pending);
    },
    async delete(email) {
      tables.pending.delete(email);
    },
  },
};
