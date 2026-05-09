# Library Extraction Audit — The Upper Room

**Date:** 2026-05-08
**Auditor:** Claude Code
**Scope:** Angular frontend — `the-upper-room` app vs `components` and `domain` libraries

---

## Executive Summary

The app contains **13 extractable items** that belong in shared libraries:

- **6 items → `components` library** (pure UI, no app-specific logic)
- **7 items → `domain` library** (app-aware, cross-cutting business concerns)

Moving these items eliminates duplication risk as new features are added, enforces the intended three-layer architecture (`api` / `components` / `domain` / app), and makes the public library surfaces match what the project structure promises.

---

## Library Architecture Recap

| Library | Purpose | Should NOT contain |
|---------|---------|-------------------|
| `api` | HTTP client wrappers + DTOs | UI, business logic |
| `components` | Generic, app-agnostic UI: components, pipes, directives, utilities | App routes, API calls, domain concepts |
| `domain` | Cross-cutting app concerns: RBAC, auth flow, shared dialogs, guards | Feature-specific pages, app routes |
| App | Feature pages, routing, app bootstrap | Reusable components, generic utilities |

---

## Section 1 — Candidates for `components` Library

These items have no app-specific imports, use only Angular/Material/RxJS primitives, and are immediately useful to any Angular app.

### 1.1 `TarNotes` — Notes composer + list

| | |
|---|---|
| **Current location** | `src/app/notes/tar-notes/` |
| **Selector** | `tar-notes` (already uses `tar-` prefix) |
| **Inputs** | `subjectType: string`, `subjectId: string` |
| **API dependency** | HTTP calls to `/api/v1/notes` (must also move notes endpoints to `api` library) |
| **Why `components`** | Fully generic — any entity (contact, idea, location) passes its type and ID; zero domain assumptions |
| **Task** | TASK-0190 |

### 1.2 `MarkdownEditor` — Markdown editor with preview + toolbar

| | |
|---|---|
| **Current location** | `src/app/ideas/markdown-editor/` |
| **Selector** | `app-markdown-editor` (rename to `tar-markdown-editor`) |
| **Inputs** | `value`, `maxLength`, `uploadUrl`, `maxUploadBytes` |
| **Outputs** | `valueChange` |
| **Why `components`** | Pure UI; upload URL is a configurable input; zero business logic |
| **Task** | TASK-0191 |

### 1.3 `NetworkService` + `OfflineBanner` — Connectivity tracking

| | |
|---|---|
| **Current location** | `src/app/network/` |
| **Files** | `network.service.ts`, `offline-banner/` |
| **Why `components`** | `NetworkService` uses only browser APIs (`navigator.onLine`, window events). `OfflineBanner` wraps `TarBanner` with no app-specific logic |
| **Task** | TASK-0192 |

### 1.4 `TranslateService` + `transloco` pipe — i18n

| | |
|---|---|
| **Current location** | `src/app/i18n/` |
| **Files** | `translate.service.ts`, `transloco.pipe.ts` |
| **Why `components`** | `TranslateService` is entirely generic; the only app dependency (`DICTIONARIES`) should become an injection token so the library is dictionary-agnostic |
| **Note** | `dictionaries.ts` stays in the app (app-specific content) |
| **Task** | TASK-0193 |

### 1.5 `breadcrumb.service` — URL-to-breadcrumb utility

| | |
|---|---|
| **Current location** | `src/app/shell/breadcrumb.service.ts` |
| **Why `components`** | Pure utility: converts URL path segments to title-cased breadcrumb objects; zero app dependencies |
| **Task** | TASK-0194 |

### 1.6 `retryInterceptor` — HTTP retry with exponential back-off

| | |
|---|---|
| **Current location** | `src/app/interceptors/retry.interceptor.ts` |
| **Why `components`** | Pure RxJS; retries GET/HEAD on network errors and 502/503/504 with exponential back-off + jitter; no app imports whatsoever |
| **Task** | TASK-0195 |

---

## Section 2 — Candidates for `domain` Library

These items have app-specific API contracts or require knowledge of app concepts (routes, tokens, permissions) but are cross-cutting — used by multiple features or the shell.

### 2.1 `tag-selector` — Tag picker component

| | |
|---|---|
| **Current location** | `src/app/tags/tag-selector/` |
| **Selector** | `app-tag-selector` (rename to `tar-tag-selector`) |
| **Why `domain`** | Used by Contacts, Ideas, and Partners features; fetches from `/api/v1/tags`; app-aware |
| **Task** | TASK-0196 |

### 2.2 `IdleService` + `InactivityDialog` — Session idle detection

| | |
|---|---|
| **Current location** | `src/app/auth/idle.service.ts`, `src/app/auth/inactivity-dialog/` |
| **Why `domain`** | Cross-cutting auth concern; `IdleService` depends on `ACCESS_TOKEN_SOURCE` and `SignOutService`; `InactivityDialog` depends on `IdleService` |
| **Task** | TASK-0197 |

### 2.3 `SignOutService` — Sign-out flow

| | |
|---|---|
| **Current location** | `src/app/auth/sign-out.service.ts` |
| **Why `domain`** | Cross-cutting: used by `InactivityDialog`, `AppShell` avatar menu, and `SessionsCard`; encapsulates confirm → API call → token clear → navigate |
| **Task** | TASK-0198 |

### 2.4 Route guards — `authGuard`, `roleGuard`, `permissionGuard`

| | |
|---|---|
| **Current location** | `src/app/rbac/guards.ts` |
| **Why `domain`** | All three guards are reused across every protected route; depend on `PermissionsService` (already in `domain`) and `ACCESS_TOKEN_SOURCE` |
| **Task** | TASK-0199 |

### 2.5 `ThemeService` — Light / dark / system theme

| | |
|---|---|
| **Current location** | `src/app/theme/theme.service.ts` |
| **Why `domain`** | Cross-cutting (used in app shell and settings page); partially app-aware (syncs preference to `/api/v1/users/me` when authenticated) |
| **Task** | TASK-0200 |

### 2.6 `CitySwitcher` — City scope picker in the toolbar

| | |
|---|---|
| **Current location** | `src/app/cities/city-switcher/` |
| **Why `domain`** | Shell component shared between `AppShell` and potentially future admin views; depends on `CityScopeService`, `PERMISSIONS_SERVICE`, and `/api/v1/cities` |
| **Task** | TASK-0201 |

### 2.7 `NotificationBell` + `NotificationPreferences` — Notification UI

| | |
|---|---|
| **Current location** | `src/app/notifications/notification-bell/`, `src/app/notifications/notification-preferences/` |
| **Why `domain`** | `NotificationBell` is embedded in `AppShell`; both depend on `/api/v1/notifications` API; cross-cutting across any page that renders the shell |
| **Task** | TASK-0202 |

---

## Section 3 — Items Correctly Placed (No Action Needed)

| Item | Location | Verdict |
|---|---|---|
| `authInterceptor` | App interceptors | OK — depends on `ACCESS_TOKEN_SOURCE` (app token); parameterize only if multi-app needed |
| `InviteUserDialog` | `domain` library | Already correct |
| `UserDetailDrawer` | `domain` library | Already correct |
| `PermissionsService` | `domain` library | Already correct |
| `has-permission.directive` | `domain` library | Already correct |
| `has-role.directive` | `domain` library | Already correct |
| `MeBootstrap` | `domain` library | Already correct |
| `optimistic-mutation` | `components` library | Already correct |
| `relative-time` | `components` library | Already correct |
| `TarAvatar` / `TarAvatarUploader` | `components` library | Already correct |
| `PasswordStrength` | `components` library | Already correct |
| `ConfirmService` | `components` library | Already correct |
| `TarSnackbarService` | `components` library | Already correct |
| Error pages, error boundary | App | Correct — app-specific routing |
| Feature pages (contacts, ideas, kanban, etc.) | App | Correct — feature-specific |

---

## Section 4 — Task Summary

| Task ID | Title | Target Library |
|---------|-------|---------------|
| TASK-0190 | Extract `TarNotes` to `components` library | `components` |
| TASK-0191 | Extract `MarkdownEditor` to `components` library | `components` |
| TASK-0192 | Extract `NetworkService` + `OfflineBanner` to `components` library | `components` |
| TASK-0193 | Extract `TranslateService` + `transloco` pipe to `components` library | `components` |
| TASK-0194 | Extract `BreadcrumbService` to `components` library | `components` |
| TASK-0195 | Extract `retryInterceptor` to `components` library | `components` |
| TASK-0196 | Extract `tag-selector` to `domain` library | `domain` |
| TASK-0197 | Extract `IdleService` + `InactivityDialog` to `domain` library | `domain` |
| TASK-0198 | Extract `SignOutService` to `domain` library | `domain` |
| TASK-0199 | Extract route guards to `domain` library | `domain` |
| TASK-0200 | Extract `ThemeService` to `domain` library | `domain` |
| TASK-0201 | Extract `CitySwitcher` to `domain` library | `domain` |
| TASK-0202 | Extract `NotificationBell` + `NotificationPreferences` to `domain` library | `domain` |

**Total: 13 tasks** — all status `Draft`, phase `X` (Cross-cutting).

---

## Section 5 — Recommended Execution Order

Dependencies exist between some tasks:

```
TASK-0198 (SignOutService → domain)
  └── TASK-0197 (IdleService + InactivityDialog → domain) [depends on SignOutService being in domain]

TASK-0199 (Route guards → domain)
  └── No external deps beyond domain's PermissionsService (already there)

TASK-0196 (TagSelector → domain) — independent
TASK-0201 (CitySwitcher → domain) — independent
TASK-0202 (NotificationBell → domain) — independent
TASK-0200 (ThemeService → domain) — independent

TASK-0193 (TranslateService → components)
  └── TASK-0190, TASK-0191 can consume it after (not blocking)

All components tasks (0190–0195) are independent of each other.
```

Safe parallel batches:
1. **Batch 1** (all independent): 0192, 0193, 0194, 0195, 0196, 0199, 0200, 0201, 0202
2. **Batch 2** (after 0195): 0190, 0191 (consume retryInterceptor if needed)
3. **Batch 3** (after 0198): 0197
