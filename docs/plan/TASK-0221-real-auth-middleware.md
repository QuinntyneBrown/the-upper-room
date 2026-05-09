---
id: TASK-0221
title: Implement real auth middleware (replace X-Test-User-Id pattern)
status: Done
phase: P
depends_on: [TASK-0220]
traces_to: []
estimated_context: medium
---

# TASK-0221: Implement real auth middleware

## Goal

Add ASP.NET Core authentication middleware that derives the current user from the JWT issued by `TASK-0220`, exposing a `ClaimsPrincipal` and a `CurrentUser` accessor that controllers can consume. This replaces the per-controller pattern of reading `X-Test-User-Id` headers (TASK-0222 then deletes those reads).

## ATDD Process — REQUIRED

1. Write failing tests first.
2. Confirm meaningful failures.
3. Implement the radically simplest middleware/accessor.

## Acceptance Tests

### Backend Integration

**Spec file(s):**
- `backend/tests/TheUpperRoom.Api.Tests/Auth/AuthMiddlewareTests.cs`

**Scenarios:**
1. A request bearing a valid `Authorization: Bearer <jwt>` resolves `HttpContext.User` to a `ClaimsPrincipal` whose `NameIdentifier` matches the token's `sub`.
2. A request with no `Authorization` header on a `[Authorize]` endpoint returns `401`.
3. A request with a JWT signed by a different key returns `401`.
4. A request with an expired JWT returns `401`.
5. The `ICurrentUser` accessor returns the same id as the resolved `ClaimsPrincipal`.

### Playwright E2E

- Not required at this stage.

## Implementation Outline

- Register `AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(...)` in `Program.cs`, wired to the same signing key as TASK-0220.
- Add `ICurrentUser` (interface) + `CurrentUser` (scoped service) reading from `IHttpContextAccessor`.
- Apply `app.UseAuthentication()` / `app.UseAuthorization()` in the pipeline.
- Do NOT yet remove `X-Test-User-Id` reads from controllers — that is TASK-0222.

## Definition of Done

- [ ] All listed integration tests pass.
- [ ] `dotnet build` and `dotnet test` green.
- [ ] At least one existing controller endpoint can be flipped to `[Authorize]` and still works in tests using a real token (smoke check).
- [ ] Status updated to `Done`.

## Out of Scope

- Removing the `X-Test-User-Id` pattern from controllers (TASK-0222).
- Role-based authorization beyond what already exists (separate work).
