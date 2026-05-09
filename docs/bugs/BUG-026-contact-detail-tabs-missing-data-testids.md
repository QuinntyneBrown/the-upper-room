# BUG-026 — Contact detail tab buttons missing data-testid attributes

| Field | Value |
|---|---|
| ID | BUG-026 |
| Severity | Medium |
| Status | Fixed |
| Discovered | TC-5.10 |
| Component | `TarTabs`, `ContactDetail` |

## Description

The `tar-tabs` component rendered by `ContactDetail` produced no `data-testid` attributes on the individual tab header buttons. The test plan requires `data-testid="contact-tab-overview"`, `data-testid="contact-tab-notes"`, and `data-testid="contact-tab-activity"` on the respective tab buttons to enable targeted automated testing.

## Root Cause

`TarTabs` had a `testId` input that set `data-testid` on the `<mat-tab-group>` host and on each panel wrapper, but did not propagate per-tab testids to the Angular Material `.mat-mdc-tab` button elements. Additionally, `contact-detail.html` did not pass `testId` to `<tar-tabs>` at all.

## Fix

1. **`frontend/projects/components/src/lib/tabs/tabs.ts`** — Added `AfterViewInit` lifecycle hook. After the view initialises, `querySelectorAll('.mat-mdc-tab')` finds each rendered tab button and sets `data-testid="<testId>-tab-<tab.id>"`.

2. **`frontend/projects/the-upper-room/src/app/contacts/contact-detail/contact-detail.html`** — Added `testId="contact"` to `<tar-tabs>`, producing the expected testids `contact-tab-overview`, `contact-tab-notes`, and `contact-tab-activity`.

3. **`frontend/dist/components`** — Rebuilt via `ng build components`.
