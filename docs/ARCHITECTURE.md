# ENIP Web: how it's built and deployed

A one-stop overview for anyone joining the project. Diagrams render on GitHub. For the planned connection to the ENIP app, see [INTEGRATION.md](./INTEGRATION.md).

## 1. What it is

**ENIP Web** is the student-facing website for ENIP (by YAL). 3rd/4th-year IIT students explore guides and seniors, verify their IIT email with a one-time code, chat with seniors, join a waitlist and refer friends to move up. It's a single **Next.js** app deployed on **Vercel**, with a **Neon Postgres** database and **Brevo** for email.

- Live site: `<fill in: https://….vercel.app or custom domain>`
- Code: <https://github.com/optimusprimeg/ENIP> (branch `main`)

## 2. Deployment

```mermaid
flowchart LR
  student["Student's browser<br/>(phone / laptop)"]
  dev["Developer PC<br/>VS Code"]
  github["GitHub<br/>optimusprimeg/ENIP"]

  subgraph vercel["Vercel"]
    app["Next.js app<br/>pages + server actions<br/>+ /r/CODE route"]
  end

  neon[("Neon Postgres<br/>students, sessions, OTP codes,<br/>waitlist, referrals, points")]
  brevo["Brevo SMTP<br/>sends OTP emails"]
  enipApp["ENIP app backend<br/>(phase 2, mocked today)"]

  student -- "HTTPS" --> app
  app -- "SQL (postgres.js + Drizzle)" --> neon
  app -- "SMTP 587" --> brevo
  brevo -- "code email" --> student
  app -. "phase 2: HTTPS API" .-> enipApp
  dev -- "git push" --> github
  github -- "auto build + deploy" --> vercel
  dev -- "npm run db:migrate" --> neon
```

**How a change goes live:** commit → `git push` to `main` → Vercel builds and deploys automatically. Other branches get their own preview URL.
**Database changes are not automatic:** after changing `src/adapters/db/schema.ts`, run `npm run db:generate` and then `npm run db:migrate` against the target database, **before** pushing code that needs the new columns.

## 3. Tech stack

| Part       | Tool                                                                                    |
| ---------- | --------------------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Cache Components, Partial Prefetching), React 19, TypeScript    |
| Styling    | Tailwind CSS 4 (design tokens in `src/app/globals.css`), Inter font, lucide-react icons |
| Validation | zod                                                                                     |
| Database   | Neon (Postgres) via Drizzle ORM + `postgres` driver; migrations in `drizzle/`           |
| Email      | Nodemailer over SMTP (Brevo now, company SMTP later)                                    |
| Hosting    | Vercel (auto-deploy from GitHub)                                                        |
| Quality    | ESLint, Prettier (`npm run check`)                                                      |

## 4. Code structure: three layers

Pages never talk to vendors directly. Each outside service sits behind one **adapter**, so it can be swapped by changing one file or an environment variable.

```mermaid
flowchart TB
  subgraph pages["Pages & server actions (src/app)"]
    home["/ home, /search, /explore"]
    join["/join, /join/verify, /signin"]
    wait["/waitlist, /r/CODE"]
    chat["/chat/[id]"]
  end

  subgraph modules["Modules: business rules (src/modules)"]
    students["students<br/>sign-up, sign-in, anti-abuse"]
    growth["growth<br/>waitlist, referrals, points"]
    chatm["chat<br/>free-message limits, locks"]
    content["content<br/>guides, locked previews"]
  end

  subgraph adapters["Adapters: the only code that knows vendors (src/adapters)"]
    auth["auth<br/>local email OTP + session cookie"]
    db["db<br/>Postgres (Drizzle)"]
    email["email<br/>smtp | dev-inbox"]
    enip["enip-app<br/>mock today, http later"]
  end

  pages --> modules --> adapters
  db --> neon[("Neon")]
  email --> brevo["Brevo"]
  enip -.-> appApi["ENIP app API (phase 2)"]
```

Product rules (points per referral, waitlist milestones, free chat limits) live in `src/config/rules.ts`; all URLs are built in `src/lib/routes.ts`.

## 5. Key flows

### Sign-up with IIT email code

```mermaid
sequenceDiagram
  actor S as Student
  participant W as Website (Vercel)
  participant DB as Neon
  participant M as Brevo

  S->>W: Fill form (name, IIT, year, IIT email, phone, how heard, referral code)
  W->>W: Check email domain matches IIT, phone format, code exists
  W->>DB: Email/phone not already used? Save pending sign-up (30 min)
  W->>DB: Save hashed 6-digit code (10 min, max 5 per hour)
  W->>M: Send code
  M-->>S: Email with code
  S->>W: Enter code
  W->>DB: Check code (max 5 tries) → create student + referral code + session
  W-->>S: Signed in → waitlist (or back to the chat they started)
```

### Referral

```mermaid
sequenceDiagram
  actor A as Referrer
  actor F as Friend
  participant W as Website
  participant DB as Neon

  A->>F: Shares link /r/ROHA47 (WhatsApp / copy)
  F->>W: Opens link
  W-->>F: Remembers code in a cookie (30 days), opens home page
  F->>W: Signs up later (code pre-filled, or typed in)
  W->>DB: After email verified: referral = successful (once per friend)
  W->>DB: +10 points to referrer (idempotent), recompute waitlist bonus
  A->>W: Waitlist page shows Joined 1, Points 10, moved up
```

Waitlist milestones: 1 referral moves you up 3 places, 2 move you up 7, and 3 skip the line. One referral also unlocks full chat.

## 6. Database (Neon Postgres)

```mermaid
erDiagram
  students ||--o| waitlist_entries : "is on"
  students ||--o{ referrals : "refers (referrer)"
  students ||--o| referrals : "was referred (referee)"
  students ||--o{ points_ledger : "earns/spends"
  students ||--o{ conversations : "starts"
  mentors ||--o{ conversations : "answers"
  conversations ||--o{ messages : "contains"
  students ||--o{ unlocks : "unlocks"
  students ||--o{ notifications : "receives"

  students {
    uuid id PK
    text email UK "verified IIT email"
    text phone UK
    text referral_code UK "e.g. ROHA47"
    text heard_from
    text app_user_id UK "phase 2 link"
  }
  waitlist_entries {
    uuid student_id PK
    int bonus_positions
    text status "waiting | admitted"
  }
  referrals {
    uuid referrer_id FK
    uuid referee_id FK "unique"
    text status
  }
  points_ledger {
    int delta
    text reason
    text ref_id "unique with reason"
  }
  mentors {
    uuid id PK
    text display_name
    text member_type "alumni | founder | yal-team | eir"
  }
  conversations {
    uuid student_id FK
    uuid mentor_id FK
  }
  messages {
    uuid conversation_id FK
    text sender
    text body
  }
```

Also: `pending_sign_ups`, `otp_codes` and `sessions` (sign-in), plus `unlocks` and `notifications` (for upcoming features). Column details: [INTEGRATION.md §3](./INTEGRATION.md).

## 7. Configuration (environment variables)

Set in **Vercel → Project → Settings → Environment Variables** (production) and in `.env.local` (local, never committed). Values are secret and are not listed here.

| Variable                                                        | Purpose                                                 | Production value |
| --------------------------------------------------------------- | ------------------------------------------------------- | ---------------- |
| `DATABASE_URL`                                                  | Neon connection string (use the pooled one)             | secret           |
| `EMAIL_PROVIDER`                                                | `smtp` sends real email; `dev-inbox` only works locally | `smtp`           |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Brevo SMTP login and verified sender                    | secret           |
| `SITE_URL`                                                      | Public address used in referral links                   | `<fill in>`      |
| `AUTH_PROVIDER`                                                 | Sign-in implementation                                  | `local`          |
| `ENIP_APP_PROVIDER`                                             | ENIP app connection                                     | `mock` (phase 1) |

After changing a variable in Vercel, **redeploy** for it to take effect.

## 8. What's real vs. placeholder today

| Area                                     | Status                                                                                                                                                                              |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sign-up, IIT email code, sign-in/out     | Real (Neon + Brevo)                                                                                                                                                                 |
| Waitlist, referral links/codes, points   | Real (Neon)                                                                                                                                                                         |
| Guides, stories, stats, testimonials     | Sample content in code (`src/modules/content/sample-data.ts`)                                                                                                                       |
| Seniors list and search                  | Sample profiles (`src/adapters/enip-app/mock.ts`)                                                                                                                                   |
| Chat                                     | Mock replies kept in server memory: **not reliable on Vercel** (each server instance has its own memory). Moving to the `conversations`/`messages` tables + a `/team` inbox is next |
| WhatsApp alerts, admin portal, CV upload | Not built yet                                                                                                                                                                       |

## 9. Running it locally

```bash
npm install
npm run dev
```

Needs a `.env.local` (copy `.env.example`) with at least `DATABASE_URL`. With `EMAIL_PROVIDER=dev-inbox`, codes appear at `http://localhost:3000/dev/inbox` instead of being emailed. Checks before pushing: `npm run check` and `npm run build`.
