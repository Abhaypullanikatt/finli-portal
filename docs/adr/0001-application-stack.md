# ADR 0001: Application stack

**Status:** Accepted for beta development  
**Date:** 2026-07-30  
**Review date:** Before real-user pilot

## Context

The team needs an Android-first product that can be operated by two engineers
without fragmenting the backend into microservices.

## Decision

- Use a pnpm/Turborepo TypeScript monorepo.
- Use Expo SDK 54 and Expo Router for physical-iPhone Expo Go compatibility
  during the SDK 57 transition. Reassess SDK 57 after the App Store Expo Go
  runtime supports it or when the team adopts development builds.
- Use a NestJS/Fastify modular monolith with versioned `/v1` APIs.
- Use shared Zod contracts and integer paise for INR money values.
- Use PostgreSQL through Prisma as the production system of record.
- Use Redis/BullMQ for expiring proposals, deletion sweeps, reports, and
  scheduled notifications once persistent adapters are enabled.
- Use Next.js for the minimal operations portal.
- Keep authentication, speech, storage, notifications, analytics, and
  scheduling behind provider boundaries.

## Consequences

The codebase is portable and supports a lean team, but external providers and
the Prisma repository must pass explicit production gates. Expo Go remains the
first development target; custom builds are introduced only when required by an
approved native integration.
