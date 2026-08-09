# ADR 0002: Development adapters and production gates

**Status:** Accepted  
**Date:** 2026-07-30  
**Review date:** Before the concierge pilot stores real participant data

## Context

Provider and legal reviews cannot be completed by source code alone. A local
vertical slice is still needed for prototype testing without sending or
retaining sensitive data externally.

## Decision

- Use an in-memory API repository for local validation only.
- Permit `demo-token` and preview OTP `123456` only outside production.
- Refuse production requests when approved OIDC mode is not configured.
- Record audio locally, delete it immediately, and use a reviewed transcript
  until a speech provider is approved.
- Expose only aggregate development metrics in the portal.
- Mark every financial result and lesson with a draft version and visible
  warning.
- Keep the Investment Explorer behind matching API/mobile feature flags and
  refuse production access while any category or matching rule is draft.

## Production gates

1. Replace the repository with Prisma transactions and migrations.
2. Configure OIDC, MFA, session revocation, and staff roles.
3. Approve retention, deletion, audit, backup, and restore procedures.
4. Complete provider DPA, residency/cross-border, deletion, exportability,
   security, cost, and outage reviews.
5. Obtain qualified financial and compliance approval.
6. Complete accessibility, penetration, load, and incident-response tests.
7. Approve every Investment Explorer category, matching rule, disclosure, and
   educational consultation boundary before enabling its production flag.

## Consequences

The local product is safe to demonstrate with synthetic data but is not a
production beta. The gates fail closed rather than silently degrading to an
unapproved provider or methodology.
