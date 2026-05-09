---
id: TASK-0072
title: Partner detail Overview tab
status: Done
phase: P
depends_on: [TASK-0071]
traces_to: [L2-036]
estimated_context: small
---

# TASK-0072: Partner detail

## Goal
`/partners/:id` with tabs Overview, Contacts (TASK-0074), Activity (placeholder until TASK-0086).

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/partners/partner-detail.spec.ts`

**Page Object:** `pages/PartnerDetailPage.ts`.

**Scenarios:**
1. Header shows logo (or letter fallback), name, website link, action row.
2. Overview tab shows description (markdown rendered), addresses, social links.
3. Visit website opens in `target=_blank rel="noopener noreferrer"`.
