---
id: TASK-0069
title: Contact list pagination + infinite scroll on XS/SM
status: Accepted
phase: C
depends_on: [TASK-0061]
traces_to: [L2-112]
estimated_context: small
---

# TASK-0069: Pagination + infinite scroll

## Goal
At MD+, render `mat-paginator` (sizes 25/50/100). At XS/SM, infinite scroll with IntersectionObserver and "Load more" fallback.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/contacts/contact-pagination.spec.ts`

**Scenarios:**
1. With 60 seeded contacts at MD+, paginator shows pages 1–3 at size 25.
2. At XS with 60 contacts, scrolling near the bottom appends the next 25 without scroll-jump.
3. With IntersectionObserver mocked unavailable, a "Load more" button appears.

## Definition of Done
- [ ] No duplicated rows on rapid scroll.
