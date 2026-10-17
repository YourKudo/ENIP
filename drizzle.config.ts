import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next.js, so load .env.local ourselves.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local: DATABASE_URL may come from the environment instead.
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/adapters/db/schema.ts",
  out: "./drizzle", // generated SQL migrations, committed to git
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
