## Project Overview

The Upper Room is a full-stack, multi-city platform for managing contacts, partners, ideas, events, locations, and Kanban boards. Its ASP.NET Core backend uses Domain, Application, Infrastructure, and API layers; its Angular frontend contains the main application and reusable API, component, and domain libraries. See `README.md` for setup and development commands.

## Backend conventions

- Keep layer dependencies pointing inward; the domain layer has no framework dependencies.
- Business rules live in handlers/domain services, not controllers.
- Seed data is idempotent and safe to re-run.
- Preserve intentional anonymous access and Swagger middleware ordering when changing API authentication.
- Keep request logging outside the exception-handling middleware so handled response statuses are logged correctly.
- Follow the existing test-project patterns when adding coverage.

## Frontend conventions

- Use the repository's formatting and lint configuration. Run `npm run lint` in `frontend/` after relevant changes.
- Components should preserve the mock design's BEM classes and accessible state semantics; e2e locators depend on that parity.
- Keep component styles encapsulated and global styles limited to shared foundations and utilities.
- Read design tokens by role rather than using hard-coded color values.
- **Declare each `ng-content` slot once.** A component that renders `<a>` or `<button>` by condition puts its slots in one `<ng-template>` and renders it with `ngTemplateOutlet` in both branches; slots repeated per `@if` branch project into one branch only. On the consumer side, an `@if` wrapping several `[slot=…]` nodes loses the slot (NG8011) — use one `@if` per node.
- API services have a contract and injection token; app pages depend on the token, not the concrete implementation.
- **No inline forms in pages.** Button-triggered editing always opens a CDK Dialog or navigates to a screen.
- Use Angular CDK Dialog/Overlay for modal behavior; don't hand-roll modals.

## E2E conventions (Playwright)

Run the relevant Playwright tests for UI changes; update baselines only for intentional design changes.

## Incremental Implementation and ATDD - mandatory

Mocks and the design system are design artifacts. ATDD does not apply to their
development. Do not write tests for mocks or the design system.

Every new feature or change to production behavior MUST have a requirement, a
detailed design, and a mock before implementation begins. This includes
behavioral changes to existing features, such as changing how a page behaves.
This requirement applies to production-code changes only; documentation-only,
design-system-only, mock-only, and test-only changes are out of scope unless
they are part of implementing a production behavior change.

Every production behavior implementation MUST invoke and follow the
`incremental-implementation` skill (`.claude/skills/incremental-implementation`
and `.agents/skills/incremental-implementation`) before any code is written,
combined with acceptance test-driven development (ATDD). Plan small,
reviewable slices, then complete one slice at a time: write Given-When-Then
acceptance criteria, write the acceptance test, and run it to prove it fails for
the expected reason BEFORE writing production code. Implement only what satisfies
that slice, refactor with tests green, and run the relevant regression checks.
Do not move to the next slice until those checks pass. No bulk implementation,
no tests added afterward, and no weakening tests to manufacture a pass. Keep
the requirement, detailed design, mock, criteria, tests, and implementation
aligned until the entire feature or behavior change is complete.

Back end: integration tests against the API. Front end: Playwright, using the
Page Object Model - one page object per screen, owning the selectors and the
interactions. Tests state intent; page objects know the DOM. Never put a
selector in a test.

Run frontend tests in Chromium only. Do not configure or run Firefox, WebKit,
or any other browser for frontend testing.

### Never write architecture tests

Never add a test that asserts the shape of the codebase rather than its behavior:
no structure, layout, or naming tests; no banned-API scans; no traceability tests
that parse the specifications. Those constraints belong to the compiler, the
formatter, and review. A test suite exists to prove behavior.
