# BUG-038 — Idea list sort dropdown does not visibly re-order cards

**Severity**: Medium
**Component**: frontend (`projects/the-upper-room/src/app/ideas/idea-list/idea-list.ts` + `.html`)
**Found in test**: TC-8.3 (idea-list-vote.spec.ts:125)
**Found**: 2026-05-09

## Description

The `<select data-testid="idea-sort-select">` is bound with `[value]="sort()"` (signal getter) and
`(change)="onSortChange(...)"`. After the user selects **Most votes**, the e2e test issues a
second `GET /api/v1/ideas?sort=votes`, but the visible card order does not change — the first
card remains the lowest-vote idea.

Either:
- The signal update doesn't trigger reactivity on the templated `<select>` `[value]` binding, so
  the second `load()` reads the stale sort value, or
- The `(change)` event-binding fires `onSortChange('votes')` but the optimistic UI does not
  await the new HTTP response before the assertion runs (test-side timing), or
- `selectOption` from Playwright dispatches a synthetic event that the `[value]` binding does
  not honour as a change.

## Reproduction

`npx playwright test --project=chromium e2e/tests/ideas/idea-list-vote.spec.ts:125`

Outcome: `expected substring "Many votes" / received "Few votes…"`.

## Expected

Selecting any sort option re-fetches with `?sort=…` and re-renders the list in the new order.

## Suggested fix

Replace the `[value] + (change)` pattern with `[(ngModel)]` or an explicit signal-driven
`ngOnChanges`-style binding, OR await `effect(() => load())` so the load is scheduled
deterministically when `sort()` changes. Add a regression spec that asserts both
`url.includes('sort=votes')` and the rendered card order.
