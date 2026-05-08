---
id: TASK-0033
title: City scoping in backend queries
status: Completed
phase: R
depends_on: [TASK-0030]
traces_to: [L2-079]
estimated_context: medium
---

# TASK-0033: City scoping

## Goal
Add the `IRequireCityScope` marker interface for MediatR commands/queries; an `AuthorizationBehavior` injects the user's `cityId` claim into the query and rejects any request that attempts to override it (via 403). EF Core global query filters apply to all city-scoped entities.

## Acceptance Tests

### Backend Integration

**File:** `TheUpperRoom.Application.Tests/CityScopingTests.cs`

**Scenarios:**
1. CityLead in city A queries `Contacts` → SQL log shows WHERE `CityId = @cityA`.
2. CityLead in city A requests contact `id` whose city is B → returns 404 (not 403, to avoid existence leak).
3. SystemAdmin in "All Cities" mode bypasses the filter (when explicitly opted in via header `X-All-Cities: true`).
4. A handler missing `IRequireCityScope` for a city-scoped entity fails an architecture test.

## Definition of Done
- [ ] Architecture test covers all city-scoped entities.
