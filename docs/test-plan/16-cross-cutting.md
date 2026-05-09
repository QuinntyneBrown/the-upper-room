# Section 16 — Cross-Cutting Concerns

> Goes beyond the user guide: typography, color, spacing, components inventory, breakpoints, a11y, CSRF, error/empty/loading states, optimistic UI rollback. These tests apply across every feature.

## Pre-conditions

- Ability to inspect Computed styles in DevTools.
- Both light and dark theme available (via `/settings/appearance`).

## Tests

### TC-16.1 — Typography token coverage

For each of the following typescale tokens defined in `frontend/projects/components/src/lib/tokens/_tokens.scss:110-124`, find one element in the rendered app that uses it and verify Computed `font` matches the spec.

| Token | Spec |
| --- | --- |
| `--md-sys-typescale-display-large` | `400 57px/64px Roboto, system-ui, sans-serif` |
| `--md-sys-typescale-display-medium` | `400 45px/52px Roboto…` |
| `--md-sys-typescale-display-small` | `400 36px/44px Roboto…` |
| `--md-sys-typescale-headline-large` | `400 32px/40px Roboto…` |
| `--md-sys-typescale-headline-medium` | `400 28px/36px Roboto…` |
| `--md-sys-typescale-headline-small` | `400 24px/32px Roboto…` |
| `--md-sys-typescale-title-large` | `400 22px/28px Roboto…` |
| `--md-sys-typescale-title-medium` | `500 16px/24px Roboto…` |
| `--md-sys-typescale-title-small` | `500 14px/20px Roboto…` |
| `--md-sys-typescale-body-large` | `400 16px/24px Roboto…` |
| `--md-sys-typescale-body-medium` | `400 14px/20px Roboto…` |
| `--md-sys-typescale-body-small` | `400 12px/16px Roboto…` |
| `--md-sys-typescale-label-large` | `500 14px/20px Roboto…` |
| `--md-sys-typescale-label-medium` | `500 12px/16px Roboto…` |
| `--md-sys-typescale-label-small` | `500 11px/16px Roboto…` |

**Pass criteria**: every token used somewhere with the exact font/size/line-height/weight; `font-family` resolves to **Roboto** (with `system-ui, sans-serif` fallback).

**Severity if failing**: Medium per token; aggregated High if multiple tokens drift.

---

### TC-16.2 — Color tokens (light theme)

Verify in DevTools (with `<html>` having no `data-theme` or `data-theme="light"`) that the following CSS variables on `:root` resolve exactly per `_tokens.scss:11-44`:

| Token | Value |
| --- | --- |
| `--md-sys-color-primary` | `#6750a4` |
| `--md-sys-color-on-primary` | `#ffffff` |
| `--md-sys-color-primary-container` | `#eaddff` |
| `--md-sys-color-on-primary-container` | `#21005d` |
| `--md-sys-color-secondary` | `#625b71` |
| `--md-sys-color-tertiary` | `#7d5260` |
| `--md-sys-color-error` | `#b3261e` |
| `--md-sys-color-background` | `#fffbfe` |
| `--md-sys-color-surface` | `#fffbfe` |
| `--md-sys-color-surface-variant` | `#e7e0ec` |
| `--md-sys-color-outline` | `#79747e` |
| `--md-sys-color-outline-variant` | `#cac4d0` |
| `--md-sys-color-inverse-surface` | `#313033` |
| `--md-sys-color-inverse-primary` | `#d0bcff` |
| `--md-sys-color-surface-container-lowest` | `#ffffff` |
| `--md-sys-color-surface-container-low` | `#f7f2fa` |
| `--md-sys-color-surface-container` | `#f3edf7` |
| `--md-sys-color-surface-container-high` | `#ece6f0` |
| `--md-sys-color-surface-container-highest` | `#e6e0e9` |

**Pass criteria**: every variable matches; sample any 5 components (filled button, outlined button, error banner, surface card, inverse snackbar) and confirm each uses the relevant token.

**Severity if failing**: High (visual regression).

---

### TC-16.3 — Color tokens (dark theme)

Switch to dark via `/settings/appearance` (or `<html data-theme="dark">`). Verify per `_tokens.scss:127-160`:

| Token | Value |
| --- | --- |
| `--md-sys-color-primary` | `#d0bcff` |
| `--md-sys-color-on-primary` | `#381e72` |
| `--md-sys-color-primary-container` | `#4f378b` |
| `--md-sys-color-on-primary-container` | `#eaddff` |
| `--md-sys-color-secondary` | `#ccc2dc` |
| `--md-sys-color-tertiary` | `#efb8c8` |
| `--md-sys-color-error` | `#f2b8b5` |
| `--md-sys-color-background` | `#1c1b1f` |
| `--md-sys-color-on-background` | `#e6e1e5` |
| `--md-sys-color-surface` | `#1c1b1f` |
| `--md-sys-color-on-surface` | `#e6e1e5` |
| `--md-sys-color-outline` | `#938f99` |
| `--md-sys-color-outline-variant` | `#49454f` |
| `--md-sys-color-inverse-primary` | `#6750a4` |
| `--md-sys-color-surface-container-lowest` | `#0f0d13` |
| `--md-sys-color-surface-container-low` | `#1d1b20` |
| `--md-sys-color-surface-container` | `#211f26` |
| `--md-sys-color-surface-container-high` | `#2b2930` |
| `--md-sys-color-surface-container-highest` | `#36343b` |

**Pass criteria**: every variable matches.

**Severity if failing**: High.

---

### TC-16.4 — Spacing tokens (4dp scale)

Per `_tokens.scss:46-60`:

| Token | Value |
| --- | --- |
| `--md-sys-space-0` | `0` |
| `--md-sys-space-1` | `4px` |
| `--md-sys-space-2` | `8px` |
| `--md-sys-space-3` | `12px` |
| `--md-sys-space-4` | `16px` |
| `--md-sys-space-5` | `20px` |
| `--md-sys-space-6` | `24px` |
| `--md-sys-space-7` | `28px` |
| `--md-sys-space-8` | `32px` |
| `--md-sys-space-10` | `40px` |
| `--md-sys-space-12` | `48px` |
| `--md-sys-space-16` | `64px` |
| `--md-sys-space-20` | `80px` |
| `--md-sys-space-24` | `96px` |

Pick 5 representative components (e.g. card padding, button gap, dialog padding, form field spacing, page header margin) and verify Computed `padding` / `gap` / `margin` resolve to one of these tokens (i.e. multiples of 4px, not arbitrary).

**Pass criteria**: no off-grid spacing.

**Severity if failing**: Medium.

---

### TC-16.5 — Shape and elevation tokens

Per `_tokens.scss:63-87`:

| Token | Value |
| --- | --- |
| `--md-sys-shape-corner-extra-small` | `4px` |
| `--md-sys-shape-corner-small` | `8px` |
| `--md-sys-shape-corner-medium` | `12px` |
| `--md-sys-shape-corner-large` | `16px` |
| `--md-sys-shape-corner-extra-large` | `28px` |
| `--md-sys-shape-corner-full` | `9999px` |

Verify a button uses `extra-small`, a card uses `medium`, a dialog uses `large`, a chip/avatar uses `full`. Elevation cards (level 1–5 per `_tokens.scss:73-87`) used on `.dashboard-widget`, drawer, FAB, dialogs.

**Pass criteria**: shapes and shadows match catalog usage.

**Severity if failing**: Medium.

---

### TC-16.6 — Material component inventory

Inventory of Material-style components present in the codebase. The frontend uses **`tar-*` wrapper components** in `frontend/projects/components/src/lib/` rather than direct `@angular/material` imports. Verify that the wrappers are used consistently and that any direct `mat-*` usage is intentional.

| `tar-*` wrapper | Source folder | Used in |
| --- | --- | --- |
| `tar-button` | `button/` | sign-in, sign-up, contact-create, profile, tags, cities, users |
| `tar-icon-button` | `icon-button/` | shell top bar, contact-create method rows |
| `tar-text-field` | `text-field/` | sign-in, sign-up, contact-create, profile, cities, tags |
| `tar-password-field` | `password-field/` | sign-in, sign-up, reset-password |
| `tar-password-strength` | `password-strength/` | sign-up |
| `tar-checkbox` | `checkbox/` | sign-up, contact-create |
| `tar-select` | `select/` | tags |
| `tar-search-field` | `search-field/` | user-list |
| `tar-avatar` | `avatar/` | contact list, contact detail |
| `tar-share-button` | `share-button/` | contact detail |
| `tar-snackbar` | `snackbar/` | mounted globally in `app.html:2` |
| `tar-confirm-dialog` | `confirm-dialog/` | mounted globally in `app.html:3` |
| `tar-empty-state` | `states/` | contact list, partner list, board list, idea list, event list, location list, user list |
| `tar-banner` | `banner/` | city-switcher (all-cities warning) |
| `tar-form-actions` | `form-actions/` | profile, cities |
| `tar-notes` | `notes/` | contact detail |
| `tar-markdown-editor` | `markdown-editor/` | idea detail |
| `tar-tag-selector` | (not in components, may be in domain) | contact-create |
| `tar-city-switcher` | `domain/cities/city-switcher/` | shell top bar |
| `tar-notification-bell` | `domain/notifications/notification-bell/` | shell top bar |
| `tar-notification-preferences` | `domain/notifications/notification-preferences/` | settings/notifications |

**Pass criteria**: every wrapper renders correctly; no naked `<button>` where a styled `tar-button` is expected (some pages use `class="btn-filled"` etc. — flag inconsistency).

**Severity if failing**: Medium per inconsistency.

---

### TC-16.7 — Responsive breakpoints

Per `frontend/projects/components/src/lib/breakpoints/_mixins.scss:4-32`:

| Breakpoint | min-width |
| --- | --- |
| sm | 576px |
| md | 768px |
| lg | 992px |
| xl | 1200px |
| xxl | 1400px |

Verify at each step:

- Drawer: hidden by default on mobile (xs), reachable via menu icon. On lg+ may be persistent (verify behavior).
- Contact list: paginator on ≥ md, **Load more** on xs.
- FAB visible on xs only (typical pattern; verify per page).
- Top bar collapses gracefully — no horizontal scroll.

**Pass criteria**: no horizontal scroll, no clipped controls at any tested viewport.

**Severity if failing**: Medium.

---

### TC-16.8 — Accessibility — color contrast

For each foreground/background pair below verify WCAG AA contrast (≥ 4.5:1 normal text, ≥ 3:1 large text and graphics):

- `--md-sys-color-on-surface` on `--md-sys-color-surface` (light: `#1c1b1f` on `#fffbfe`).
- `--md-sys-color-on-primary` on `--md-sys-color-primary` (light: `#ffffff` on `#6750a4`).
- `--md-sys-color-on-error` on `--md-sys-color-error` (light: `#ffffff` on `#b3261e`).
- Repeat under dark theme using the dark overrides.

**Pass criteria**: every pair passes AA at the size used.

**Severity if failing**: Critical (a11y compliance).

---

### TC-16.9 — Accessibility — ARIA roles and labels

Spot-check key surfaces:

| Element | Required attributes |
| --- | --- |
| Top bar (`app-shell.html:12`) | `<header>` with descriptive structure |
| Drawer (`app-shell.html:50`) | `aria-hidden` toggling |
| Breadcrumbs (`app-shell.html:61`) | `aria-label="Breadcrumb"`; last crumb `aria-current="page"` |
| Skip link | visible-on-focus |
| Notification menu (`tar-notification-bell.html:16`) | `role="dialog" aria-label="Notifications"` |
| Tabs (notifications, partner-detail) | `role="tablist" / "tab"` and `aria-selected` |
| Listbox results (search) | `role="listbox" / "option"` |
| Dialog overlays | `role="dialog" aria-modal="true"` and a labelling element (`aria-labelledby` or `aria-label`) |
| Icon-only buttons | `aria-label` (e.g. notification bell, avatar, drawer toggle, FABs) |

**Pass criteria**: every documented attribute present.

**Severity if failing**: Medium (a11y).

---

### TC-16.10 — CSRF protection

**Steps**

1. From DevTools issue `POST /api/v1/auth/sign-out` without the `X-XSRF-TOKEN` header.

**Behavior verification**

- Returns `403` (or whatever `CsrfMiddleware` enforces). Endpoint guarded by `[RequireXsrf]` (`backend/src/TheUpperRoom.Api/Auth/AuthController.cs:75`).
- Frontend error catalog maps `csrf.invalid → "Your action could not be verified."` (`frontend/projects/the-upper-room/src/app/interceptors/error-catalog.ts:21`).

**Pass criteria**: CSRF middleware blocks unprotected mutations.

**Severity if failing**: Critical.

---

### TC-16.11 — Error boundary catches runtime errors

**Steps**

1. Trigger a runtime error in a component (e.g. throw in a click handler via DevTools). 

**UI verification**

- `<app-error-boundary>` mounted from `app.html:5` renders fallback UI without unmounting the entire app shell.

**Pass criteria**: error contained; rest of app remains usable.

**Severity if failing**: High.

---

### TC-16.12 — Snackbar

**Steps**

1. Trigger any notification (e.g. successful save).

**UI verification**

- `<tar-snackbar>` in `app.html:2` renders the message at the bottom of the viewport.
- Auto-dismiss after a default duration; or persists for errors.

**Pass criteria**: snackbar appears and dismisses correctly.

**Severity if failing**: Medium.

---

### TC-16.13 — Confirm dialog

**Steps**

1. Trigger any destructive action that goes through `<tar-confirm-dialog>` (e.g. card delete).

**UI verification**

- Dialog has title, body, and Cancel/Confirm buttons (`Confirm` styled as danger when destructive).
- Backdrop click and Esc cancel it.

**Pass criteria**: every destructive flow uses the same dialog.

**Severity if failing**: Medium.

---

### TC-16.14 — Empty states

Confirm every list view renders the right `tar-empty-state` when its data set is empty:

| Page | Icon | Heading | Body |
| --- | --- | --- | --- |
| Contacts | `person_add` | "No contacts yet" | "Add your first contact to get started." |
| Partners | `domain_disabled` | "No partners yet" | "Add your first partner to get started." |
| Boards | `view_kanban` | "No boards yet" | "Create a board to organize your work." |
| Ideas | `lightbulb` | "No ideas yet" | "Be the first to share an idea." |
| Events | `event` | "No events yet" | "Events will appear here once scheduled." |
| Locations | `location_off` | "No locations yet" | "Add your first venue or location." |
| Users (admin) | `contacts` | "No users found" | "Try adjusting your filters or invite a new user." |
| Notifications | `notifications_off` | "You're all caught up" | (no body) |
| Search | `search_off` | "No matches" | "Try different keywords or check your filters." |
| Audit | (text-only) | (none) | "No audit entries found." |

**Pass criteria**: every entry exact.

**Severity if failing**: Low per cell.

---

### TC-16.15 — Loading states

**Steps**

1. Throttle network to **Slow 3G** in DevTools.
2. Navigate between pages.

**UI verification**

- Each list/detail page should display a loading indicator (skeleton, spinner, or progress bar from `frontend/projects/components/src/lib/progress-spinner/` or `progress-bar/`) until data arrives.

**Pass criteria**: no blank pages while loading; loader visible until first frame.

**Severity if failing**: Medium.

---

### TC-16.16 — Optimistic UI rollback

**Steps**

1. With the network blocked or returning errors, attempt an action that uses optimistic update — for example, vote on an idea (`TC-8.4`) or move a card (`TC-7.7`).

**UI verification**

- UI updates immediately when the user clicks.
- On error response, UI reverts to the prior state.
- An error toast appears via `tar-snackbar`.

**Behavior verification**

- Optimistic helper from `frontend/projects/components/src/lib/optimistic-mutation/` (verify utility name).

**Pass criteria**: state always converges to server truth; no orphan UI updates on failure.

**Severity if failing**: Critical (data divergence).

---

### TC-16.17 — Offline banner

**Steps**

1. Toggle offline in DevTools › Network.

**UI verification**

- `<app-offline-banner>` (mounted in `app-shell.html:47`) renders a visible offline notice.
- Going back online removes it.

**Pass criteria**: banner appears within seconds of going offline.

**Severity if failing**: Medium.

---

### TC-16.18 — Inactivity dialog

**Steps**

1. Sign in and leave the app idle for the configured timeout (verify in `frontend/projects/the-upper-room/src/app/auth/` or shell).

**UI verification**

- `<app-inactivity-dialog>` (mounted in `app.html:4`) opens with a continue/sign-out prompt.
- After the warning timeout it forces sign-out.

**Pass criteria**: dialog appears at the right time; sign-out occurs.

**Severity if failing**: High (security/session).

---

### TC-16.19 — Correlation ID propagation

**Steps**

1. In DevTools › Network inspect any API request.

**Behavior verification**

- Response header `X-Correlation-Id` echoes whatever the client sent (or a server-generated guid if none) — see `backend/src/TheUpperRoom.Api/Program.cs:55-62`.
- Server-side log entries include the same correlation id (visible in `InMemorySink` logs).

**Pass criteria**: round-trip correlation works.

**Severity if failing**: Medium (observability).

---

### TC-16.20 — Sensitive-field scrubbing in logs

**Steps**

1. Submit a sign-in request with a body containing `password`.
2. Inspect server logs (e.g. via the in-memory sink or stdout).

**Behavior verification**

- The `SensitiveFieldScrubber` Serilog enricher (`backend/src/TheUpperRoom.Api/Logging/`, registered at `Program.cs:9`) removes/masks `password` and similar fields.

**Pass criteria**: no plaintext password in logs.

**Severity if failing**: Critical (PII / secret leakage).
