# The Upper Room — Test Plan

A page-by-page, test-case-by-test-case verification plan for The Upper Room. Mirrors the structure of `docs/user-guide.md`. If a tester executes every case in this plan and finds zero defects, the build is considered flawless.

## How to use this plan

1. Read `00-overview.md` first — it covers conventions, environment setup, credentials, and how to inspect persistence state.
2. Walk the section files (`01-…` through `16-…`) in order. Each test case is self-contained and can be re-run independently.
3. Record pass/fail per `TC-N.X` identifier. Any failure must be filed against the severity rating included in the test case.

## Index

| File | Summary |
| --- | --- |
| [00-overview.md](./00-overview.md) | Purpose, scope, conventions, environment setup, test credentials, persistence inspection. |
| [01-getting-started.md](./01-getting-started.md) | Browsers, viewports, asset/font loading, initial landing page, theme bootstrap. |
| [02-authentication.md](./02-authentication.md) | Sign in, sign up, accept invitation, forgot/reset password, sign out, rate limits, password strength. |
| [03-navigation.md](./03-navigation.md) | Top bar, breadcrumbs, side drawer, city switcher data scoping, skip-to-main link. |
| [04-dashboard.md](./04-dashboard.md) | Welcome header, stat cards, upcoming events list, tasks-on-my-boards groupings. |
| [05-contacts.md](./05-contacts.md) | List, search, archived filter, paginator/load-more, create, view, edit, archive, delete. |
| [06-partners.md](./06-partners.md) | List, search, archived filter, create with logo, edit, link/unlink contacts, archive, delete. |
| [07-kanban-boards.md](./07-kanban-boards.md) | Board list, wizard, board view, configure, tag/archive filters, add card, drag-drop, move sheet, WIP, dialog, swimlanes. |
| [08-ideas.md](./08-ideas.md) | List, My-ideas filter, sort, submit, vote, idea detail with comments, status chip. |
| [09-events-calendar.md](./09-events-calendar.md) | List, status filter, list/calendar view, calendar nav, create with location/virtual/capacity/RSVP, edit, cancel, RSVP, ICS export. |
| [10-locations.md](./10-locations.md) | List, archived badge, create, view detail, delete with confirmation. |
| [11-profile-settings.md](./11-profile-settings.md) | Profile edit, avatar upload, sessions list and revoke, appearance theme, notification preferences. |
| [12-notifications.md](./12-notifications.md) | Bell panel, unread highlighting, click-through, mark-all-read, jump to settings. |
| [13-global-search.md](./13-global-search.md) | Ctrl+K open, cross-entity results, keyboard navigation, empty state, Esc to close. |
| [14-admin.md](./14-admin.md) | RBAC visibility, tags admin, cities admin, users admin, audit log filters and pagination. |
| [15-keyboard-shortcuts.md](./15-keyboard-shortcuts.md) | Every shortcut from the user guide, focus management, skip link. |
| [16-cross-cutting.md](./16-cross-cutting.md) | Typography, color, spacing tokens, Material component inventory, breakpoints, a11y, CSRF, error/empty/loading states, optimistic UI rollback. |

## Source-of-truth references

- User guide: `docs/user-guide.md`
- Routes: `frontend/projects/the-upper-room/src/app/app.routes.ts`
- Design tokens: `frontend/projects/components/src/lib/tokens/_tokens.scss`
- Breakpoints: `frontend/projects/components/src/lib/breakpoints/_mixins.scss`
- Backend in-memory stores: `backend/src/TheUpperRoom.Api/<Feature>/`
- Audit log store: `backend/src/TheUpperRoom.Api/Audit/AuditStore.cs`
- Error catalog: `frontend/projects/the-upper-room/src/app/interceptors/error-catalog.ts`
