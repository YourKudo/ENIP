import type {
  Db,
  OtpCodeRecord,
  PendingSignUp,
  SessionRecord,
  StudentRecord,
} from "./index";

// DEV ONLY: records live in memory and reset when the server restarts.
// Used when DATABASE_URL is not set.

type Tables = {
  students: Map<string, StudentRecord>;
  pending: Map<string, PendingSignUp>;
  otpCodes: Map<string, OtpCodeRecord>;
  sessions: Map<string, SessionRecord>;
};

// Kept on globalThis so data survives the dev server's hot reloads.
const tables: Tables = ((globalThis as { __enipDb?: Tables }).__enipDb ??= {
  students: new Map(),
  pending: new Map(),
  otpCodes: new Map(),
  sessions: new Map(),
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
  otpCodes: {
    async get(email) {
      return tables.otpCodes.get(email) ?? null;
    },
    async put(code) {
      tables.otpCodes.set(code.email, code);
    },
    async addFailedAttempt(email) {
      const code = tables.otpCodes.get(email);
      if (code)
        tables.otpCodes.set(email, { ...code, attempts: code.attempts + 1 });
    },
    async delete(email) {
      tables.otpCodes.delete(email);
    },
  },
  sessions: {
    async get(tokenHash) {
      return tables.sessions.get(tokenHash) ?? null;
    },
    async put(session) {
      tables.sessions.set(session.tokenHash, session);
    },
    async delete(tokenHash) {
      tables.sessions.delete(tokenHash);
    },
  },
};
