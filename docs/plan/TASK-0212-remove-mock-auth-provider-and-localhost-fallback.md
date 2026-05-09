---
id: TASK-0212
title: Remove MockAuthProvider and localhost redirectUri fallback
status: Done
phase: P
depends_on: []
traces_to: []
estimated_context: small
---

# TASK-0212: Remove MockAuthProvider and localhost redirectUri fallback

## Goal

Delete `src/app/auth/mock-auth-provider.ts` (which contains hardcoded test credentials `test@example.com` / `Password!23456`) and replace the hardcoded `http://localhost:4200` fallback in `src/app/auth/idp-config.ts:16` with an environment-driven value. Even though `MockAuthProvider` is not currently wired into `app.config.ts`, leaving the file in the source tree risks a future re-wiring that would ship test credentials to production.

## ATDD Process — REQUIRED

1. Write the failing tests below.
2. Confirm meaningful failures.
3. Make them green with the radically simplest code.

## Acceptance Tests

### Unit / Integration

- `idp-config.spec.ts`:
  1. Given `environment.idpRedirectUri` is set, the resolved `redirectUri` equals that value.
  2. Given `environment.idpRedirectUri` is unset, the resolved `redirectUri` throws or returns a clearly defined non-localhost value (decide in implementation, document in comment).
- `auth.config.spec.ts` — assert `MockAuthProvider` is not exported from any barrel and not imported anywhere in `src/app`.

### Playwright E2E

- Not required (no user-facing change).

## Implementation Outline

- Delete `src/app/auth/mock-auth-provider.ts`.
- Add `idpRedirectUri` to `environment.ts` and `environment.production.ts`. Replace `http://localhost:4200` literal in `idp-config.ts:16` with the env value.
- Update any imports referencing `MockAuthProvider` (per audit there are none in production paths — verify).
- `npm run lint` and `npm run typecheck`.

## Definition of Done

- [ ] Unit tests pass.
- [ ] `grep -r "MockAuthProvider\|mock-auth-provider" frontend/projects/the-upper-room/src` returns no matches.
- [ ] `grep -r "localhost:4200" frontend/projects/the-upper-room/src` returns no matches outside `environment.ts` files.
- [ ] Status updated to `Done`.

## Out of Scope

- Reworking the IdP config beyond the redirect URI fallback.
- Migrating test fixtures that reference `test@example.com` (those live in `e2e/`).
