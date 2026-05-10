# BUG-038 — RESOLVED (test-only) — Idea list sort dropdown e2e race

**Severity**: Low (test infra only)
**Component**: frontend e2e (`projects/the-upper-room/e2e/tests/ideas/idea-list-vote.spec.ts:125`)
**Found in test**: TC-8.3
**Found**: 2026-05-09
**Status**: FIXED 2026-05-09

## Description

The original BUG-038 hypothesis (broken `[value] + (change)` reactivity) turned out to be wrong.
A direct browser probe confirmed that selecting **Most votes** does fire `GET /api/v1/ideas?sort=votes`
and the response sorts the cards. The e2e failure was a **test-side race**: the spec called
`sortSelect().selectOption('votes')` and immediately read `ideaCard(0).textContent()` without
waiting for the second HTTP response, so it asserted against the still-cached card order from
the initial load.

## Fix

Update the spec to await the sorted response before asserting:

```ts
await Promise.all([
  page.waitForResponse((r) => r.url().includes('/api/v1/ideas') && r.url().includes('sort=votes')),
  list.sortSelect().selectOption('votes'),
]);
await expect(list.ideaCard(0)).toContainText('Many votes');
```

After the change the spec passes (1.4s).

## Component behaviour confirmed correct

`idea-list.ts:46-58` `buildParams()` correctly serialises `?sort=votes`; `(change)` handler updates
the signal and triggers `load()`; the new HTTP response refreshes the `ideas` signal and the DOM.
No app changes needed.
