# Financial Companion

An Android-first financial education, budgeting, and explainable planning beta
for young salaried Indians.

The mobile development runtime uses Expo SDK 54 so it can open in the current
App Store version of Expo Go on a physical iPhone.

This repository implements a working vertical slice of the planned product:

- Expo Router mobile app
- NestJS/Fastify versioned API
- Deterministic financial-health, risk, and roadmap engine
- Manual and privacy-first voice-assisted expense entry
- Budget summaries and contextual lessons
- Goal-aware, education-only Investment Explorer
- Consultation requests
- Consent history, data export, and deletion
- Minimal Next.js operations portal
- PostgreSQL/Prisma target schema

## Important beta status

The rule set and lesson content are marked `draft-not-adviser-approved`.
Production use with real financial information is blocked until:

1. A qualified financial reviewer approves the methodology and worked personas.
2. Compliance counsel approves the education/guidance boundary and disclosures.
3. An OIDC provider with MFA and staff-role mapping is configured.
4. The Prisma repository replaces the in-memory development adapter.
5. Speech, email, storage, analytics, and hosting vendors pass privacy, deletion,
   residency/cross-border, security, and outage reviews.
6. Retention periods and incident procedures are approved and tested.
7. Investment category content and matching metadata are approved by a
   qualified financial reviewer before enabling the production feature flag.

The beta does not recommend or execute a security or financial product.
Investment Explorer results personalize what to learn, keep every selected
category visible, and never display named products, allocations, market prices,
or transaction actions.

## Workspace

```text
apps/
  api/       NestJS/Fastify modular API and Prisma schema
  mobile/    Expo Router Android-first app
  portal/    Minimal operations overview
packages/
  contracts/ Shared Zod schemas and TypeScript contracts
  financial-engine/ Versioned assessment and roadmap rules
content/
  lessons/ Draft contextual lessons
  questionnaires/ Draft methodology
  disclosures/ Beta disclosure
docs/
  research/ Interview plan
  pilot/ Concierge pilot scorecard
  adr/ Architecture decisions and production gates
```

## Requirements

- Node.js 22.13 or later
- Corepack
- Expo Go for the first mobile run
- PostgreSQL 17 and Redis only when replacing the development adapters

## Install and verify

```bash
corepack pnpm install
PATH="$PWD/scripts/bin:$PATH" corepack pnpm typecheck
PATH="$PWD/scripts/bin:$PATH" corepack pnpm test
PATH="$PWD/scripts/bin:$PATH" corepack pnpm build
```

## Run locally

Start the mobile development stack (API and Expo together):

```bash
cd apps/mobile
./script/build_and_run.sh
```

Use the matching `Run` or `Run Web` action in Codex. From the shell, web and
physical-device tunnel modes are available without pointing the client at
`localhost`:

```bash
./script/build_and_run.sh --web
./script/build_and_run.sh --tunnel
```

The development command starts the API on port 4000 and routes mobile requests
through Expo's development server, which works on simulators, emulators, and
physical devices. To run the two processes separately, start the API with
`pnpm --filter @financial-companion/api dev` and provide an explicit
`EXPO_PUBLIC_API_URL` when starting Expo. The development app uses `demo-token`
until a passwordless session is created from the sign-in screen.

Start the operations portal:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/v1 \
PORTAL_ROLE=operations \
PATH="$PWD/scripts/bin:$PATH" corepack pnpm --filter @financial-companion/portal dev
```

Local passwordless authentication uses code `123456`. Production refuses to
operate in development auth mode.

## Voice workflow

The mobile app requests purpose-specific consent and microphone permission,
records with `expo-audio`, and immediately deletes the local recording. Until a
speech provider is approved, the user enters or corrects the transcript before
the API creates proposed transactions.

Transcripts never create authoritative transactions. Each proposal must be
confirmed by the user and expires within 24 hours.

## Investment Explorer

The Learn tab opens a three-screen category-education flow. The API links every
result to the exact profile, assessment, consent disclosure, goal, content
version, and rule version used to generate it. Draft content works with
synthetic data in development but fails closed in production.

Use `INVESTMENT_EXPLORER_ENABLED=true` for the API and
`EXPO_PUBLIC_INVESTMENT_EXPLORER_ENABLED=true` for the matching mobile build.
Production also requires every category and matching rule to carry an approved
qualified-review record.

## Persistence

`apps/api/prisma/schema.prisma` is the reviewed target data model. The current
API uses an in-memory adapter so the full flow can run without external services
or accidentally retain real financial data during validation.

Do not use the in-memory adapter for a real-user pilot. Implement the Prisma
repository, migrations, encrypted backups, deletion jobs, retention sweeps, and
restore testing before that gate.

## Validation workflow

- Use `docs/research/interview-guide.md` for 30 interviews.
- Use `docs/pilot/scorecard.md` for the 20-user concierge pilot.
- Do not increase feature scope when a gate fails.
- Record financial, privacy, and architecture changes as new ADRs and rule-set
  versions.
