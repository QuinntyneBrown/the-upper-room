# BUG-039 — Idea status chip uses one colour for all statuses

**Severity**: Low (per TC-8.9 plan)
**Component**: frontend (`projects/the-upper-room/src/app/ideas/idea-detail/idea-detail.scss`)
**Found in test**: TC-8.9 (status chip styling per status)
**Found**: 2026-05-09

## Description

The status chip on idea detail (`<span data-testid="idea-status-chip">`) renders the status text
correctly, but its visual styling does not differ by status. The SCSS defines a single
`.idea-status-chip` rule with `background: var(--md-sys-color-secondary-container)` and applies
that to every status. There are no modifier classes per status (`--Proposed`, `--Submitted`,
`--Selected`, `--InProgress`, `--Completed`, `--Archived`).

The test plan TC-8.9 explicitly asks for distinct color tokens per status — the user should be
able to identify status visually, not just by text.

## Reproduction

1. Open `/ideas/{id}` for two ideas with different statuses (e.g. Draft and Submitted).
2. Inspect both `<span data-testid="idea-status-chip">` elements.
3. Both have the same computed background-color and color.

## Expected

Each status maps to a distinct surface tone (e.g. Draft → outline, Submitted → tertiary container,
Selected → primary container, InProgress → secondary container, Completed → tertiary fixed,
Archived → surface variant).

## Suggested fix (ATDD)

1. In `idea-detail.html`, add a status-derived class binding on the chip:
   ```html
   <span data-testid="idea-status-chip"
         class="idea-status-chip"
         [class]="'idea-status-chip idea-status-chip--' + i.status.toLowerCase()">
     {{ i.status }}
   </span>
   ```
2. In `idea-detail.scss`, add a modifier per status with a distinct Material token.
3. Add a regression spec that mounts the detail view with each status and asserts the
   `getComputedStyle(...).backgroundColor` differs across statuses.
