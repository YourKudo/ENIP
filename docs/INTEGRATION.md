# ENIP Web ↔ ENIP App: data model and integration contract

**Status:** proposal from the web team, v0.1 (2026-10-17). For review by the ENIP app team.

**Goal:** the website runs on its own for phase 1. YAL team members act as seniors, and students chat, refer and join the waitlist on the web. In phase 2 it connects to the app with a few small, well-defined calls, without a rewrite.

---

## 1. Principles

1. **Clear ownership: nothing is stored in both places.**
   - **The web owns** the growth features: waitlist, referrals, invites, points, unlocks, WhatsApp notifications, and (phase 1 only) mentor profiles and chats.
   - **The app owns** the core product: user accounts, alumni, real chats, Discovery.
2. **One shared identity key: the verified institute email** (lowercase). Every web record also has an `app_user_id` column, empty until phase 2 links it. Matching people across systems is exact, with no guessing and no duplicate accounts (PRD FR-09).
3. **The web never reads the app's database directly, and the reverse holds too.** All communication is HTTPS + JSON, server to server, with an API key in each direction.
4. **Safe to retry:** every write carries an id the receiver can de-duplicate on (`Idempotency-Key` header or a `client…Id` field). Points and referral credit can never be granted twice (PRD NFR-04).
5. **Conventions:** UUID ids, ISO-8601 UTC timestamps, points as integers, emails lowercase, phones in E.164 (`+91XXXXXXXXXX`).

---

## 2. Phases

|                             | Phase 1 (now, ~1–2 months)                               | Phase 2 (connect to the app)                      |
| --------------------------- | -------------------------------------------------------- | ------------------------------------------------- |
| Student accounts            | Web DB (IIT email OTP)                                   | Web DB **+ linked** to app user via `app_user_id` |
| Seniors shown on web        | Web DB `mentors` (YAL Team / EIR / alumni who volunteer) | Read from the app's alumni API                    |
| Chats                       | Web DB; mentors reply from the web team inbox (`/team`)  | The app's chat API; seniors reply in the app      |
| Waitlist, referrals, points | Web DB                                                   | Web DB (the app reads them through the web API)   |
| WhatsApp alerts             | Web sends on mentor reply                                | Web sends on the app's `message.created` webhook  |

In code, only `src/adapters/enip-app/` changes: phase 1 uses `local.ts` (our DB), phase 2 uses `http.ts` (the app API). Pages and rules stay as they are.

---

## 3. Web database (Postgres)

Owner shown per table. "→ Phase 2" says what happens to it when we connect.

### students (web)

| column              | type               | notes                                                                                                        |
| ------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------ |
| id                  | uuid PK            | the web's id; tracks points and referrals                                                                    |
| app_user_id         | text, unique, null | set when linked to the app user (phase 2)                                                                    |
| email               | text, unique       | verified institute email, lowercase                                                                          |
| email_verified_at   | timestamptz        |                                                                                                              |
| name                | text               |                                                                                                              |
| iit_id              | text               | e.g. `bombay` (see `src/config/iits.ts`)                                                                     |
| graduation_year     | int                |                                                                                                              |
| phone               | text, unique       | `+91…`                                                                                                       |
| whatsapp_consent    | bool               | FR-21                                                                                                        |
| whatsapp_consent_at | timestamptz, null  | when consent was given                                                                                       |
| heard_from          | text, null         | "How did you hear about us?" id (`friend`, `whatsapp`, `instagram`, `linkedin`, `senior`, `campus`, `other`) |
| referral_code       | text, unique       | first 4 letters of the name + 2 random digits, e.g. `ROHA47`; shared as the link `/r/ROHA47`                 |
| role                | text               | `student` (default). Not used yet: `/team` access comes from the `TEAM_EMAILS` list                          |
| created_at          | timestamptz        |                                                                                                              |

→ Phase 2: the web calls `POST /v1/users:upsert` on the app (see §4.1) and stores the returned `app_user_id`.

### pending_sign_ups (web)

Form details between the sign-up form and the OTP check (30 min), plus the `referral_code` used (typed, or remembered for 30 days from a `/r/CODE` link). Pending rows with a code show as "Pending" invites to the referrer.

### otp_codes, sessions (web)

Email-OTP sign-in: code hash, expiry, attempts, send times; session token hash, student id, expiry. These are replaced if the team chooses an auth provider (Supabase Auth or similar).

### mentors (web, phase 1)

| column             | type                     | notes                                                                                                                           |
| ------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| id                 | uuid PK                  |                                                                                                                                 |
| student_id         | uuid FK → students, null | not used yet (any `TEAM_EMAILS` member can reply as any profile)                                                                |
| app_user_id        | text, null               | their app account, if they have one                                                                                             |
| display_name       | text                     | real name or chosen username                                                                                                    |
| avatar_url         | text, null               |                                                                                                                                 |
| institute, branch  | text                     |                                                                                                                                 |
| batch              | int                      |                                                                                                                                 |
| job_title, company | text                     |                                                                                                                                 |
| help_with          | text                     | one line: how they can help                                                                                                     |
| topics             | text[]                   |                                                                                                                                 |
| member_type        | text                     | `alumni` \| `founder` \| `yal-team` \| `eir`. **FR-18: team members are never labelled `alumni` unless they are actual alumni** |
| is_active          | bool                     | hide without deleting                                                                                                           |

→ Phase 2: profiles come from the app's alumni API. Phase-1 mentors who have app accounts map by `app_user_id`.

### conversations, messages (web, phase 1)

- **conversations:** id, student_id, mentor_id, created_at, `app_conversation_id` (null). Unique per (student, mentor).
- **messages:** id, conversation_id, sender (`student` \| `mentor`), kind (`text` \| `cv`), body, attachment_url (null), `sent_by` (the `/team` member's email, on mentor replies), created_at, `app_message_id` (null).

→ Phase 2: new chats live in the app. Phase-1 history is either copied into the app once (if the app team wants it) or kept read-only on the web.

### waitlist_entries (web)

student_id PK, joined_at, bonus_positions (int, from referrals), status (`waiting` \| `admitted`), admitted_at. The position is calculated from `joined_at` and `bonus_positions`, never stored, so it's always consistent.

### referrals (web)

| column                  | type                           | notes                                                                       |
| ----------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| id                      | uuid PK                        |                                                                             |
| referrer_id             | uuid FK → students             |                                                                             |
| referee_id              | uuid FK → students, **unique** | a student can be referred only once                                         |
| code_used               | text                           |                                                                             |
| status                  | text                           | `pending` → `successful` (referee verified their IIT email) or `ineligible` |
| ineligible_reason       | text, null                     | `already_registered`, `self_referral`                                       |
| created_at, verified_at | timestamptz                    |                                                                             |

### points_ledger (web)

id, student_id, delta (int, + earn / − spend), reason (`referral`, `unlock_resource`, `unlock_chat`, …), ref_id (e.g. referral id), created_at. **Unique (reason, ref_id)** makes rewards idempotent. Balance = sum(delta).

### unlocks (web)

student_id, item_type (`resource` \| `chat`), item_id, points_spent, created_at. Unique (student_id, item_type, item_id).

### notifications (web)

id, student_id, channel (`whatsapp`), template, payload (json), status (`queued` \| `sent` \| `failed`), provider_message_id, error, created_at. A failed send never loses the chat message (FR-22).

---

## 4. API contract (phase 2)

Auth: `Authorization: Bearer <key>` with a separate key per direction (`APP_API_KEY` for web→app, `WEB_API_KEY` for app→web). Webhooks are also signed: `X-ENIP-Signature: sha256=<HMAC of the body>`. Writes send `Idempotency-Key: <uuid>`.

### 4.1 Web → App (the app team implements)

| Call                                        | Purpose                                     | Request → Response                                                                                                         |
| ------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `POST /v1/users:upsert`                     | Create or find a user by verified email     | `{ email, name, iitId, graduationYear, phone, emailVerifiedAt, referredByAppUserId? }` → `{ appUserId, created: boolean }` |
| `GET /v1/alumni?query=&limit=`              | Search seniors, ranked (the app's AI Match) | → `{ items: AlumniProfile[] }`                                                                                             |
| `GET /v1/alumni/:id`                        | One profile                                 | → `AlumniProfile`                                                                                                          |
| `POST /v1/conversations`                    | Start or get a chat                         | `{ appUserId, alumniId }` → `{ conversationId }`                                                                           |
| `GET /v1/conversations/:id/messages?after=` | Read messages                               | → `{ items: ChatMessage[] }`                                                                                               |
| `POST /v1/conversations/:id/messages`       | Student sends                               | `{ kind, text, clientMessageId }` → `ChatMessage`                                                                          |
| Deep link                                   | Open the app on Discovery / a chat          | e.g. `enip://discovery`, `enip://chat/:conversationId` (format from the app team)                                          |

The shapes match the web's existing TypeScript types in `src/adapters/enip-app/index.ts`:

```ts
type AlumniProfile = {
  id: string;
  displayName: string; // real name or chosen username, per the member's setting
  avatarUrl: string | null;
  institute: string;
  branch: string;
  batch: number;
  jobTitle: string;
  company: string;
  helpWith: string; // one line: how they can help
  topics: string[];
  memberType: "alumni" | "founder" | "yal-team" | "eir";
};

type ChatMessage = {
  id: string;
  from: "student" | "senior";
  kind: "text" | "cv"; // for "cv", text is the file name (URL later)
  text: string;
  sentAt: string; // ISO-8601
};
```

### 4.2 App → Web (the web team implements)

| Call                                     | Purpose                                            | Request → Response                                                                                                                  |
| ---------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/v1/students/:appUserId/growth` | Show waitlist and points inside the app            | → `{ waitlistPosition: number \| null, admitted: boolean, referrals: { successful, pending }, points, referralCode, referralLink }` |
| `POST /api/v1/referrals:redeem`          | Someone joined **in the app** with a referral code | `{ appUserId, email, code }` → `{ status: "successful" \| "ineligible", reason? }`                                                  |
| `POST /api/v1/webhooks/app`              | Events from the app                                | `{ id, type, createdAt, data }`. Types: `message.created` (alum replied, so the web sends a WhatsApp alert), `user.created`         |

The web de-duplicates webhooks by event `id`.

---

## 5. Phase 2 cut-over steps

1. The app team ships §4.1. The web adds `src/adapters/enip-app/http.ts` and sets `ENIP_APP_PROVIDER=http`.
2. One-time backfill: for each web student, call `users:upsert` and store `app_user_id`.
3. Mentors: map phase-1 team profiles to app accounts, or retire them.
4. Chats: stop creating web conversations; optionally copy history to the app.
5. The app starts calling §4.2 (growth endpoint, webhooks).

## 6. Questions for the app team

1. What database and stack does the app backend use (Postgres? MongoDB? Firebase?), and what does the chat run on?
2. Could the web's tables live in a **separate schema in the same database** instead? That would make phase 2 simpler.
3. Is the institute email unique per app user today? What identifies a user: email, phone, or both?
4. Is there an existing OTP/auth service the web should reuse (PRD FR-07)?
5. Deep-link format for Discovery and chats.
