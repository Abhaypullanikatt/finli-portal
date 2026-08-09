# Financial Companion architecture and flow audit

Date: 2026-08-01

## Verdict

The target architecture is directionally correct: an Expo client, a versioned
NestJS modular monolith, shared runtime-validated contracts, authoritative and
versioned financial rules on the backend, and a relational persistence target
are appropriate for this beta.

The current repository is still a validation slice rather than a production
beta. Its boundaries are conceptually sound, but persistence, authentication,
speech processing, operational authorization, and offline storage remain
development substitutes.

## User-flow decisions

Keep the four primary tabs:

1. Home — current status and exactly one recommended action.
2. Spending — transaction capture and monthly summary.
3. Learn — Investment Explorer first, short lessons second.
4. You — profile versions, consent, privacy, sign-in, and support.

The corrected first-run path is:

1. Resolve the secure session.
2. Check for a current financial profile.
3. Send signed-out users to passwordless sign-in.
4. Send users without a profile to five short onboarding steps.
5. Generate the assessment and roadmap.
6. Open Home with one recommended action.

The corrected Investment Explorer path is:

1. Explain the educational purpose and obtain specific consent.
2. Select general learning or a current goal.
3. Show the read-only risk context.
4. Select one or more interests.
5. Generate a versioned result.
6. Open category education or request an educator call.

The transaction path remains confirmation-first:

1. Enter an expense manually or dictate into the text field.
2. Parse one or more proposals.
3. Review and correct every proposal.
4. Confirm before creating an authoritative transaction.

The current “voice” feature uses operating-system keyboard dictation. It does
not yet record audio or call an approved speech-to-text provider. It must not be
represented as the production voice workflow until the provider adapter,
short-lived encrypted upload, deletion verification, and retention sweep exist.

## What is correct today

- Money uses integer paise and INR contracts.
- Profile snapshots, assessments, roadmaps, explorer preferences, and explorer
  results are versioned and linked.
- Financial and explorer matching logic is deterministic on the backend.
- Selected investment categories are never hidden by the matching engine.
- Voice-derived records remain proposals until confirmation.
- Purpose-specific consent, withdrawal, export, and deletion flows exist in the
  validation adapter.
- API errors are structured and client writes use idempotency keys where retry
  duplication is likely.
- Production fails closed for development authentication and unapproved
  Investment Explorer content.

## Required corrections before a real-user beta

### Release blockers

- Replace the in-memory store with a Prisma/PostgreSQL repository and migrations.
- Wrap consent, profile creation, assessment generation, and roadmap generation
  in a server-side database transaction; the client must not coordinate this
  critical workflow across separate writes.
- Replace development bearer tokens with approved passwordless/OIDC sessions,
  recovery, expiry, rotation, and staff MFA/role mapping.
- Add an approved speech provider adapter or explicitly keep keyboard dictation
  as the only beta feature. Do not ship a non-functional record button.
- Obtain qualified approval for financial rules and investment content.

### Important product and data gaps

- The budget endpoint is currently a spending-versus-income summary. Persistent
  monthly budgets and category limits from the product plan are not implemented.
- Updating a financial profile creates a new snapshot, but production must also
  invalidate and regenerate dependent assessment and explorer state atomically.
- Cached React Query data survives temporary failures only while the app process
  remains alive. Encrypted, retention-aware offline reading is not implemented.
- The API is one controller and one store class. Split it into identity/consent,
  profile, assessment/roadmap, transactions/budgeting, education/investment,
  consultation, and privacy modules while keeping one deployment.
- Add pagination before transaction and audit histories grow.
- Persist explicit audit events for confirmation, correction, export, deletion,
  and staff access; technical logs are not the audit record.

## Recommended implementation order

1. Prisma repository and transactional profile-to-roadmap workflow.
2. Production authentication and staff authorization.
3. Persistent budgets and category limits.
4. Chosen voice scope: approved STT workflow or keyboard dictation only.
5. Encrypted offline cache for approved educational content and the latest
   generated result, with consent-withdrawal eviction.
6. End-to-end tests for first run, profile update invalidation, explorer flow,
   transaction confirmation, export, and deletion.

Microservices are not recommended at this stage. Extract a worker only for
speech, retention, reports, or notifications when operational isolation is
actually required.
