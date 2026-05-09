# The Upper Room — Implementation Plan

This plan implements every requirement in `../specs/L1.md` and `../specs/L2.md`. Tasks are **vertically sliced**: every task ends with a passing Playwright e2e test (using the Page Object Model) that proves the slice works end-to-end. No task is "infrastructure only" — even tokens and lint rules are validated through a feature interaction.

## Mandatory Process — ATDD

**Every task in this plan MUST be implemented using Acceptance Test Driven Development.** No exceptions.

1. **Write the failing acceptance tests first.** Start with the Playwright e2e test (using a Page Object class). Add unit/integration tests where they make sense, also failing.
2. **Run the tests and confirm they fail for the right reason** (not from a typo, missing dependency, or build error). Read the failure carefully.
3. **Write the radically simplest production code that makes the tests pass.** No speculative abstractions. No "while I'm here" cleanup. No fields/components/endpoints the tests don't drive.
4. **Refactor only with green tests.** If the refactor fails any test, revert.
5. **No production code is written without a failing test driving it.** If you find yourself writing code with no test, stop and write the test first.

When a task lists tests, those are the *minimum* acceptance criteria. Add more tests if you uncover edge cases — but production code follows tests, never the other way around.

## Page Object Model Convention

E2E tests live under:
```
frontend/projects/the-upper-room/e2e/
  pages/                  // Page Objects, one per route or modal
    SignInPage.ts
    ContactsListPage.ts
    ContactDetailPage.ts
    ContactFormPage.ts
    ...
  components/             // Reusable POM fragments (NavDrawer, AppBar, Snackbar, ConfirmDialog)
  fixtures/               // Test data + factories
  tests/
    auth/sign-in.spec.ts
    contacts/create-contact.spec.ts
    ...
```

Rules (enforced by `the-upper-room/playwright-no-raw-locators` lint rule per L2-102):
- **Spec files MUST NOT call `page.locator(...)` directly.** All locators live on Page Object classes.
- Each spec file's first non-import line is `// Traces to: L2-XXX[, L2-XXX...]`.
- Each Page Object class exposes `goto()`, named getters returning `Locator`, and high-level action methods (e.g. `fillEmail()`, `submit()`).
- Selectors prefer `data-testid="<bem-block>__<element>"` first, then ARIA roles/labels, then text. Never CSS classes for selection.

## Task File Convention

Every task is one markdown file `TASK-XXXX-<slug>.md` with frontmatter:
```yaml
---
id: TASK-XXXX
title: <human title>
status: Draft        # Draft → Ready → In Progress → In Review → Done
phase: <phase code>
depends_on: [TASK-XXXX, ...]
traces_to: [L2-XXX, ...]
---
```

Allowed status transitions: `Draft` → `Ready` (when deps are merged) → `In Progress` (when an engineer claims) → `In Review` → `Done`.

A task is **Done** only when:
1. All listed Playwright e2e tests pass on CI.
2. All listed unit/integration tests pass.
3. Coverage gates from L2-101 are met.
4. Lint, format, and type-check are green.
5. The task's L2 trace comments are present in every test file it added.

## Phase Map

| Code | Phase | Tasks |
|------|-------|-------|
| F | Foundation | TASK-0001..0014 |
| A | Authentication | TASK-0020..0027 |
| R | RBAC | TASK-0030..0033 |
| U | User Management | TASK-0040..0045 |
| CI | Cities & Tags | TASK-0050..0053 |
| C | Contacts | TASK-0060..0069 |
| P | Partners | TASK-0070..0076 |
| N | Notes | TASK-0080..0082 |
| K | Kanban | TASK-0090..0099 |
| I | Ideas | TASK-0100..0103 |
| L | Locations | TASK-0110..0111 |
| E | Events & Calendar | TASK-0120..0128 |
| H | Dashboard | TASK-0130 |
| S | Search | TASK-0140 |
| No | Notifications | TASK-0150..0154 |
| Au | Audit & Logs | TASK-0160..0161 |
| X | Cross-cutting | TASK-0170..0176 |
| Z | Hardening | TASK-0180..0189 |

## Full Task List with Dependencies

### Phase F — Foundation

| ID | Title | Depends on | L2 |
|----|-------|------------|-----|
| TASK-0001 | Bootstrap Angular workspace, .NET solution, landing page | — | L2-074, L2-080 |
| TASK-0002 | M3 design tokens (color, type, space, elevation, shape, motion) | 0001 | L2-001..L2-006 |
| TASK-0003 | Iconography registry (Material Symbols Rounded) | 0002 | L2-007 |
| TASK-0004 | Breakpoint mixins + responsive grid | 0002 | L2-008 |
| TASK-0005 | App shell skeleton (toolbar, drawer, breadcrumbs, footer) | 0002, 0003, 0004 | L2-009..L2-014 |
| TASK-0006 | Lint rules (BEM, file-per-type, spacing-token-only, i18n literal, contract-token, playwright POM) | 0001 | L2-081, L2-082, L2-083, L2-100, L2-003 |
| TASK-0007 | HTTP interceptors (correlation, auth, retry, error mapping) | 0001 | L2-084, L2-065 |
| TASK-0008 | Snackbar service with severity tokens | 0002 | L2-061 |
| TASK-0009 | Confirmation dialog service | 0002 | L2-099 |
| TASK-0010 | Empty / Loading / Skeleton / List-error states | 0002 | L2-103..L2-105 |
| TASK-0011 | Static error pages: 404, 403, 500, generic boundary | 0005 | L2-067..L2-069 |
| TASK-0012 | Offline banner | 0005 | L2-070 |
| TASK-0013 | i18n with Transloco (en-CA) | 0001 | L2-100, L2-110 |
| TASK-0014 | Theme toggle (light/dark/system) + persistence | 0002, 0005 | L2-115 |

### Phase A — Authentication

| ID | Title | Depends on | L2 |
|----|-------|------------|-----|
| TASK-0020 | Sign-in page (UI + mock auth provider) | 0005, 0007, 0008 | L2-016 |
| TASK-0021 | PKCE + BFF token exchange | 0020 | L2-015 |
| TASK-0022 | Sign-up page + invitation acceptance | 0021 | L2-017 |
| TASK-0023 | Email verification flow | 0022 | L2-018 |
| TASK-0024 | Forgot/reset password | 0021 | L2-020 |
| TASK-0025 | Password policy (12+, HIBP, strength meter) | 0022 | L2-019 |
| TASK-0026 | Sign out (revoke + clear) | 0021 | L2-021 |
| TASK-0027 | Session inactivity timeout dialog | 0021 | L2-022 |

### Phase R — RBAC

| ID | Title | Depends on | L2 |
|----|-------|------------|-----|
| TASK-0030 | Roles, permissions, seeding (DB + API) | 0021 | L2-023 |
| TASK-0031 | Frontend route guards (auth + role) | 0020, 0030 | L2-024 |
| TASK-0032 | `*tarHasPermission` / `*tarHasRole` directives | 0030 | L2-025 |
| TASK-0033 | City-scoping behavior on backend | 0030 | L2-079 |

### Phase U — User Management

| ID | Title | Depends on | L2 |
|----|-------|------------|-----|
| TASK-0040 | User list page (admin) | 0031, 0032 | L2-026 |
| TASK-0041 | Invite user dialog | 0040 | L2-027 |
| TASK-0042 | User detail drawer (admin actions) | 0040 | L2-028 |
| TASK-0043 | My Profile page | 0021 | L2-107 |
| TASK-0044 | Avatar component + upload | 0043 | L2-106 |
| TASK-0045 | Active sessions / revoke other devices | 0043, 0026 | L2-107 |

### Phase CI — Cities & Tags

| ID | Title | Depends on | L2 |
|----|-------|------------|-----|
| TASK-0050 | City CRUD + listing | 0030 | L2-013 backbone |
| TASK-0051 | City switcher (SystemAdmin top-bar) | 0050 | L2-109 |
| TASK-0052 | Tag CRUD page (admin) | 0030 | L2-038, L2-039 |
| TASK-0053 | Tag selector reusable component | 0052 | L2-040 |

### Phase C — Contacts

| ID | Title | Depends on | L2 |
|----|-------|------------|-----|
| TASK-0060 | Contact data model + minimal API + empty list page | 0033, 0010 | L2-029, L2-030 (empty), L2-077 |
| TASK-0061 | Contact list responsive grid + filters/search | 0060, 0053 | L2-030 |
| TASK-0062 | Contact create form (basic info) | 0060 | L2-032 |
| TASK-0063 | Contact phones / emails / addresses sub-forms | 0062 | L2-029, L2-032 |
| TASK-0064 | Contact tags assignment | 0062, 0053 | L2-029 |
| TASK-0065 | Contact detail Overview tab | 0062 | L2-031 |
| TASK-0066 | Contact edit form | 0062 | L2-032 |
| TASK-0067 | Contact archive / restore | 0066 | L2-033 |
| TASK-0068 | Contact delete (typed confirm + soft delete) | 0066, 0009 | L2-033 |
| TASK-0069 | Contact list pagination + infinite scroll on XS/SM | 0061 | L2-112 |

### Phase P — Partners

| ID | Title | Depends on | L2 |
|----|-------|------------|-----|
| TASK-0070 | Partner data model + API + list page | 0033, 0010 | L2-034, L2-035, L2-077 |
| TASK-0071 | Partner create form | 0070 | L2-037 |
| TASK-0072 | Partner detail Overview | 0071 | L2-036 |
| TASK-0073 | Partner edit | 0071 | L2-037 |
| TASK-0074 | Partner ↔ Contact link with role | 0072, 0065 | L2-036 |
| TASK-0075 | Partner social links sub-form | 0073 | L2-034, L2-037 |
| TASK-0076 | Partner archive / delete | 0073, 0009 | L2-034 |

### Phase N — Notes (cross-entity)

| ID | Title | Depends on | L2 |
|----|-------|------------|-----|
| TASK-0080 | Note data model + API + Markdown sanitization | 0033 | L2-041, L2-093 |
| TASK-0081 | Notes tab component (composer + list) | 0080, 0065 | L2-042 |
| TASK-0082 | Note edit history dialog | 0081 | L2-041 |

### Phase K — Kanban

| ID | Title | Depends on | L2 |
|----|-------|------------|-----|
| TASK-0090 | Board CRUD + list page | 0033, 0010 | L2-043, L2-044 |
| TASK-0091 | Board view (columns + read-only cards) | 0090 | L2-045 |
| TASK-0092 | Drag-and-drop cards across columns | 0091 | L2-045 |
| TASK-0093 | WIP limits (visual + server enforcement) | 0092 | L2-043, L2-045 |
| TASK-0094 | Card detail dialog | 0091 | L2-046 |
| TASK-0095 | Column configuration (rename / reorder / color) | 0090 | L2-047 |
| TASK-0096 | Card schema editor | 0090, 0094 | L2-047 |
| TASK-0097 | Swimlanes | 0091 | L2-043 |
| TASK-0098 | Mobile swipeable columns (XS) | 0091 | L2-045 |
| TASK-0099 | Card archive + delete | 0094, 0009 | L2-046 |

### Phase I — Ideas

| ID | Title | Depends on | L2 |
|----|-------|------------|-----|
| TASK-0100 | Idea data model + API + list with vote | 0033, 0010 | L2-048, L2-049 |
| TASK-0101 | Idea detail + Markdown editor | 0100 | L2-050, L2-051 |
| TASK-0102 | Idea status workflow | 0101 | L2-048, L2-050 |
| TASK-0103 | Idea cover image upload + partner linking | 0101, 0070 | L2-051 |

### Phase L — Locations

| ID | Title | Depends on | L2 |
|----|-------|------------|-----|
| TASK-0110 | Location CRUD + list page | 0033, 0010 | L2-057, L2-058 |
| TASK-0111 | Location detail (map + photo carousel + upload) | 0110 | L2-058, L2-113 |

### Phase E — Events & Calendar

| ID | Title | Depends on | L2 |
|----|-------|------------|-----|
| TASK-0120 | Event data model + API + list page | 0033, 0070, 0110 | L2-052, L2-053 |
| TASK-0121 | Calendar Month view | 0120 | L2-054 |
| TASK-0122 | Calendar Week / Day / Agenda views | 0121 | L2-054 |
| TASK-0123 | Event detail page | 0120 | L2-055 |
| TASK-0124 | Event create / edit form | 0120, 0070, 0110 | L2-056 |
| TASK-0125 | RSVP + capacity + waitlist | 0123 | L2-052, L2-055 |
| TASK-0126 | ICS download | 0123 | L2-055 |
| TASK-0127 | Event recurrence | 0124 | L2-056 |
| TASK-0128 | Event cancellation + approval flow | 0123, 0125 | L2-055, L2-052 |

### Phase H — Dashboard

| ID | Title | Depends on | L2 |
|----|-------|------------|-----|
| TASK-0130 | Dashboard page (stats + activity + my ideas + tasks + upcoming) | 0060, 0070, 0100, 0120, 0090 | L2-059 |

### Phase S — Search

| ID | Title | Depends on | L2 |
|----|-------|------------|-----|
| TASK-0140 | Global search dialog + cross-resource backend endpoint | 0060, 0070, 0100, 0110, 0120 | L2-060, L2-077 |

### Phase No — Notifications

| ID | Title | Depends on | L2 |
|----|-------|------------|-----|
| TASK-0150 | Notification data model + API + dispatch service | 0033 | L2-062, L2-063 |
| TASK-0151 | Notification bell + inbox menu | 0150, 0005 | L2-062 |
| TASK-0152 | Notification preferences page | 0150 | L2-064 |
| TASK-0153 | Email channel for notifications | 0150 | L2-063 |
| TASK-0154 | Push channel via PWA service worker | 0150, 0173 | L2-063 |

### Phase Au — Audit & Logging

| ID | Title | Depends on | L2 |
|----|-------|------------|-----|
| TASK-0160 | Audit trail persistence + admin log page | 0033 | L2-098 |
| TASK-0161 | Structured logging (Serilog) + correlation propagation | 0007, 0033 | L2-097 |

### Phase X — Cross-cutting

| ID | Title | Depends on | L2 |
|----|-------|------------|-----|
| TASK-0170 | Date / number formatting (en-CA) + relative time | 0013 | L2-110 |
| TASK-0171 | Time zone handling (UTC server, browser display, event-tz pick) | 0124 | L2-111 |
| TASK-0172 | Optimistic UI patterns (vote, RSVP, archive, kanban move) | 0008, 0092, 0100 | L2-114 |
| TASK-0173 | PWA manifest + service worker (shell-only cache) | 0001 | L2-117, L2-116 |
| TASK-0174 | Print stylesheet | 0005 | L2-119 |
| TASK-0175 | Browser support detection banner | 0005 | L2-120 |
| TASK-0176 | Deep link share button + clipboard | 0008 | L2-118 |
| TASK-0190 | Extract TarNotes to components library | 0081 | — |
| TASK-0191 | Extract MarkdownEditor to components library | 0101 | — |
| TASK-0192 | Extract NetworkService + OfflineBanner to components library | 0012 | — |
| TASK-0193 | Extract TranslateService + transloco pipe to components library | 0013 | — |
| TASK-0194 | Extract BreadcrumbService to components library | 0005 | — |
| TASK-0195 | Extract retryInterceptor to components library | 0007 | — |
| TASK-0196 | Extract tag-selector to domain library | 0053 | — |
| TASK-0197 | Extract IdleService + InactivityDialog to domain library | 0027, 0198 | — |
| TASK-0198 | Extract SignOutService to domain library | 0026 | — |
| TASK-0199 | Extract route guards to domain library | 0031, 0032 | — |
| TASK-0200 | Extract ThemeService to domain library | 0014 | — |
| TASK-0201 | Extract CitySwitcher to domain library | 0051 | — |
| TASK-0202 | Extract NotificationBell + NotificationPreferences to domain library | 0151, 0152 | — |

### Phase Z — Hardening

| ID | Title | Depends on | L2 |
|----|-------|------------|-----|
| TASK-0180 | Security headers + HSTS + CSP | 0001 | L2-092 |
| TASK-0181 | Rate limiting (sign-in, forgot, generic) | 0021 | L2-094 |
| TASK-0182 | CSRF protection (anti-forgery) | 0021 | L2-096 |
| TASK-0183 | Input HTML sanitization (server) | 0080 | L2-093 |
| TASK-0184 | Secrets management (Key Vault / env) | 0001 | L2-095 |
| TASK-0185 | Bundle budgets + Lighthouse-CI | 0001 | L2-089, L2-090 |
| TASK-0186 | Coverage gates in CI | 0001 | L2-101 |
| TASK-0187 | k6 API load tests | 0060, 0070 | L2-091 |
| TASK-0188 | Accessibility audit (axe-playwright + manual keyboard) | 0005 | L2-085..L2-088 |
| TASK-0189 | Reduced-motion support pass | 0002 | L2-006 |

## Critical Path

The shortest viable end-to-end demo:
`0001 → 0002 → 0005 → 0007 → 0020 → 0021 → 0030 → 0033 → 0060 → 0061 → 0062 → 0065`

After that, branches (Partners, Kanban, Ideas, Events, etc.) can be parallelized as soon as their dependencies merge.

## Conventions Reminder

- `data-testid` is the preferred selector. Format: `<bem-block>__<element>` (e.g., `contact-form__submit`).
- Every Playwright spec begins with `// Traces to: L2-XXX`.
- Every C#/TS test starts with `// Traces to:` (or `# Traces to:` for Python).
- No production code without a failing test.
- No new public surface without an L2 backing it. If an L2 is missing, stop and update `../specs/L2.md` first.
