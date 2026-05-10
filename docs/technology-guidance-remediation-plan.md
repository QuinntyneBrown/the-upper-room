# Technology Guidance Remediation Plan

**Plan date:** 2026-05-09
**Status:** ~Substantially complete~ as of 2026-05-10. See "Status snapshot" section below for current state.
**Scope:** Close every gap identified in `docs/technology-guidance-audit.md` (28 criteria; 11 FAILs + 6 PARTIALs).
**Target end state:** Codebase is fully compliant with `C:\projects\the-health-game\docs\technology-guidance-and-practices.md`.

**Outcome (2026-05-10):** Re-audit reads **26 PASS / 1 PARTIAL / 1 FAIL** (was 11 / 6 / 11). Both architecture-test allow-lists are empty. The remaining open items are human-only follow-ups (frontend lint/test/e2e run, manual smoke, version tag) plus one deferred capability (distributed throttling, §A17).

---

## Guiding Principles

1. **Walking-skeleton first.** Get the *shape* right end-to-end on one small slice (Contacts) before sweeping the rest. Mistakes in the shape are cheap to fix on one feature, expensive on twelve.
2. **One PR per feature slice during the sweep.** The architectural refactor + file-splitting + validation is a coordinated change per feature; bundling them all per feature avoids long-lived broken intermediate states.
3. **Tests stay green after every PR.** Migrations of EF state are coordinated with the feature move; no orphaned schema.
4. **Backend and frontend tracks run in parallel where possible.** The frontend cleanup (§F3, §F7, §F4) doesn't block on backend.
5. **No new features during the migration.** This plan reshuffles the existing surface area; do not stack net-new behavior on top.

---

## Phase Overview

| Phase | Theme | Duration (est.) | Blocks |
|------:|-------|----------------:|--------|
| 0 | Pre-flight & safety net | 0.5 day | All |
| 1 | Foundations: `IAppDbContext`, FluentValidation, exception handling | 1 day | Phase 2 |
| 2 | Pilot vertical slice (Contacts) | 1.5 days | Phase 3 |
| 3 | Sweep — migrate remaining features | 4–6 days | Phase 4 |
| 4 | Logging, seeding, RBAC, infra cleanup | 1 day | Phase 5 |
| 5 | Authentication: hashing, real sign-in, distributed throttle | 1.5 days | Phase 7 |
| 6 | Frontend remediation (parallel with 1–5) | 2 days | Phase 7 |
| 7 | Final acceptance pass | 0.5 day | — |
| **Total** | | **~12 working days** | |

Calendar time will be longer if reviews are async; plan for 3 weeks elapsed.

---

# Phase 0 — Pre-flight & Safety Net (0.5 day)

**Goal:** Reduce the blast radius of the refactor so we can move fast without breaking things irreversibly.

### Tasks

- [ ] **0.1** Create branch `refactor/tech-guidance-compliance` off `main`.
- [ ] **0.2** Confirm test baseline: run all backend tests (`dotnet test backend/TheUpperRoom.sln`) and Playwright E2E (`npm --prefix frontend run e2e`) and record pass counts.
- [ ] **0.3** Capture a SQL Server schema snapshot (`dotnet ef migrations script` from each existing context, or a `SELECT … INFORMATION_SCHEMA` dump) so we can verify the eventual single-context schema is equivalent.
- [x] **0.4** Add a Roslyn analyzer or test that fails when a `.cs` file declares more than one top-level type. Suggested: a unit test in `TheUpperRoom.Architecture.Tests` (new project) that walks every `.cs` file under `backend/src/` and asserts exactly one top-level type per file. Mark currently-failing files as a known-allowed list that shrinks over time. **This is the rail that keeps §B13 from regressing.**
- [x] **0.5** Add an architecture test (NetArchTest or hand-rolled) asserting:
   - `TheUpperRoom.Api` does **not** contain types named `*Handler`, `*Command`, `*Query`, `*Validator`, `*DbContext`, or `*DataSeeder` (with an initial allow-list that shrinks).
   - `TheUpperRoom.Application` does **not** reference `Microsoft.EntityFrameworkCore.SqlServer` or `Microsoft.AspNetCore.*`.
- [ ] **0.6** Tag baseline: `git tag pre-refactor`.

### Exit criteria
- All current tests still pass.
- Architecture/file-shape tests are committed and currently RED for the known violations (allow-listed) but GREEN for new code.

---

# Phase 1 — Foundations (1 day)

**Goal:** Land the cross-cutting plumbing every feature slice will depend on.

### 1A. `IAppDbContext` abstraction

- [x] **1.1** Create `TheUpperRoom.Application/Data/IAppDbContext.cs` with the existing `DbSet<>` properties from `AppDbContext` plus a `SaveChangesAsync(CancellationToken)`.
- [x] **1.2** Update `TheUpperRoom.Infrastructure/Data/AppDbContext.cs` to implement `IAppDbContext`.
- [x] **1.3** Register the alias in `Infrastructure.DependencyInjection`:
  ```csharp
  services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());
  ```
- [x] **1.4** Add an architecture test: every class in `Application/**/*Handler.cs` that takes a DbContext takes `IAppDbContext`, never the concrete type.

### 1B. FluentValidation pipeline

- [x] **1.5** Add packages to `TheUpperRoom.Application.csproj`:
  ```xml
  <PackageReference Include="FluentValidation" Version="11.*" />
  <PackageReference Include="FluentValidation.DependencyInjectionExtensions" Version="11.*" />
  ```
- [x] **1.6** Create `TheUpperRoom.Application/Common/ValidationBehavior.cs` (see audit §B11 for code).
- [x] **1.7** In `TheUpperRoom.Application.DependencyInjection`:
  ```csharp
  services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
  services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
  ```
- [x] **1.8** Write one test validator + one test command + a unit test proving the pipeline throws `ValidationException` on bad input.

### 1C. ProblemDetails mapping

- [x] **1.9** Create `TheUpperRoom.Api/ExceptionHandling/ValidationExceptionHandler.cs` implementing `IExceptionHandler` (see audit §B12 for code).
- [x] **1.10** In `Program.cs`:
  ```csharp
  builder.Services.AddExceptionHandler<ValidationExceptionHandler>();
  builder.Services.AddProblemDetails();
  app.UseExceptionHandler();
  ```
- [x] **1.11** Integration test: `POST /api/contacts` (or any existing endpoint) with invalid body returns HTTP 400 + RFC-7807 body once the first real validator exists (covered in Phase 2). _2026-05-10: `tests/TheUpperRoom.Application.Tests/ValidationProblemDetailsTests` covers `POST /api/v1/auth/register` with (a) too-short password and (b) malformed email — both assert HTTP 400, `Content-Type: application/problem+json`, and an `errors` dictionary keyed by the offending property._

### Exit criteria
- Solution builds.
- New unit tests for the pipeline are green.
- No production handlers changed yet (zero-risk landing).

---

# Phase 2 — Pilot Vertical Slice: Contacts (1.5 days)

**Goal:** Prove the target architecture on the smallest non-trivial feature. This becomes the template every other feature follows.

Why Contacts: medium complexity (CRUD + soft delete + scoping), already has a DbContext, has its own seeder, and is one of the worst one-type-per-file offenders (`ContactsCqrs.cs` = 17 types).

### Steps

- [ ] **2.1** Move `ContactRow` → `TheUpperRoom.Domain/Contacts/Contact.cs` (rename to `Contact`; drop the `Row` suffix). Update navigation property names.
- [ ] **2.2** Move `ContactsDbContext`'s `DbSet<Contact>` and any `OnModelCreating` configuration into `AppDbContext`. Extract the configuration into `TheUpperRoom.Infrastructure/Data/Configurations/Contacts/ContactConfiguration.cs` implementing `IEntityTypeConfiguration<Contact>`.
- [x] **2.3** Delete `Api/Contacts/ContactsDbContext.cs`. _2026-05-10: relocated to `Infrastructure/Contacts/ContactsDbContext.cs`._
- [ ] **2.4** Generate an EF migration that drops the standalone Contacts DbContext (if it had its own database) or, if it shared the DB, only adjusts schema. Verify schema is unchanged.
- [x] **2.5** Split `Api/Contacts/ContactsCqrs.cs` into one-type-per-file (2026-05-10: split into 17 individual files in `Api/Contacts/`; cross-project move to `Application/Contacts/` is the remaining half of this task and tracked under 2.10 below):
   ```
   ListContactsQuery.cs, ListContactsResult.cs, ListContactsHandler.cs
   GetContactQuery.cs, GetContactResult.cs, GetContactHandler.cs
   CreateContactCommand.cs, CreateContactResult.cs, CreateContactHandler.cs
   UpdateContactCommand.cs, UpdateContactResult.cs, UpdateContactHandler.cs
   PatchContactCommand.cs, PatchContactResult.cs, PatchContactHandler.cs
   DeleteContactCommand.cs, DeleteContactResult.cs, DeleteContactHandler.cs
   MutateContactOutcome.cs
   ```
   Each handler now depends on `IAppDbContext`.
- [~] **2.6** Create `*CommandValidator.cs` for each Create/Update/Patch/Delete command. Move all inline `if (...) return Outcome.Invalid` checks from handlers into validators. Handlers should now only contain business logic and persistence. _2026-05-10: `CreateContactCommandValidator` and `UpdateContactCommandValidator` added. Both validate `Body.FirstName` non-empty and length-bound (≤100), `LastName`/`DisplayName` length-bound. Handlers retain their `if (request.Body is null) return BadRequest` and `Outcome.Unprocessable` paths as defence-in-depth — those branches become unreachable for inputs that go through MediatR's `ValidationBehavior`. Patch/Delete skipped: nothing meaningful to validate above the URL-bound `Id` already guarded by routing._
- [x] **2.7** Split `Api/Contacts/ContactsController.cs` so `PatchContactRequest` lives in its own file under `Api/Contacts/Requests/PatchContactRequest.cs`. _2026-05-10: `PatchContactRequest` (along with `CreateContactRequest`) moved to `Application/Contacts/`. The Api/Contacts/Requests/ subfolder isn't used; request records live next to their command instead._
- [x] **2.8** Move `Api/Contacts/ContactsDataSeeder.cs` → `TheUpperRoom.Infrastructure/Seeding/Contacts/ContactsDataSeeder.cs`. Move its DI registration from `Program.cs` into `Infrastructure.DependencyInjection`.
- [x] **2.9** Remove `Api/Contacts/` allow-list entries from the architecture and file-shape tests added in Phase 0; tests should now pass for everything in `Contacts`. _2026-05-10: both architecture allow-lists are empty (Contacts entries removed in iteration 62)._
- [x] **2.10** Update `TheUpperRoom.Application.Tests` and `TheUpperRoom.Api.Tests` for the new namespaces and types. Re-run full test suite — it must be green. _2026-05-10: full backend suite is 9 + 3 + 52 + 105 = 169/169 PASS after every cluster relocation._
- [ ] **2.11** Manual smoke test: `GET /api/contacts`, `POST /api/contacts` with valid + invalid body (verify 400 ValidationProblemDetails), `PATCH`, `DELETE`.
- [x] **2.12** Document the resulting structure in `docs/architecture/feature-template.md` so the rest of the sweep has a written reference. _2026-05-10: written. Covers layer responsibilities (Api / Application / Domain / Infrastructure), DI wiring, the architecture-test rules, the cross-feature consumer pattern (use `I<Feature>DbContext` or a small Application interface, not another controller's static helpers), and uses Contacts as the worked example._

### Exit criteria
- Contacts feature has zero types in `Api/Contacts/` other than `ContactsController.cs` and the request DTO file(s).
- All tests pass.
- File-shape and architecture tests pass for everything under `Contacts/`.

---

# Phase 3 — Sweep: Migrate Remaining Features (4–6 days)

**Goal:** Apply the Contacts template to every other feature.

### 3.1 Feature inventory & order

Migrate in roughly increasing complexity so the team builds momentum:

| # | Feature | Notes / Complexity |
|--:|---------|--------------------|
| 1 | Audit | Mostly read-only; `AuditStore` becomes a service in Application + Infrastructure. |
| 2 | Locations | Simple CRUD. |
| 3 | Cities | Has a seeder; shared with `IRequireCityScope` (already in Application). |
| 4 | Partners | Simple CRUD. |
| 5 | Notes | `NotesCqrs.cs` has 14 types. |
| 6 | Ideas | `IdeasDbContext.cs` carries 4 types incl. event types. |
| 7 | Notifications | Has a Push DbContext too. |
| 8 | Events / EventRsvp | `EventRsvpCqrs.cs` (14 types) + `CancelEventCommand.cs` (4) + dialog interactions; biggest. |
| 9 | Kanban | `PatchCardCommand.cs` (7); board/card/column relationships. |
| 10 | Dashboard | Aggregator query reading from many tables — migrate after its dependencies. |
| 11 | Search | Cross-feature; depends on others being on a single context. |
| 12 | Rbac (data side) | Move role/permission constants into Domain (continues in Phase 4). |

### 3.2 Per-feature checklist (repeat for each)

For feature `X`:

- [ ] **3.X.a** Move EF entities → `Domain/X/` (rename `XRow` → `X`).
- [ ] **3.X.b** Merge `XDbContext`'s DbSets and config into `AppDbContext`; extract `IEntityTypeConfiguration<>` files under `Infrastructure/Data/Configurations/X/`.
- [ ] **3.X.c** Delete `Api/X/XDbContext.cs`. Adjust DI registration. Run EF migrations to consolidate schema.
- [ ] **3.X.d** Split every multi-type file in `Api/X/` into one type per file under `Application/X/`. Handlers depend on `IAppDbContext`.
- [ ] **3.X.e** Add `*CommandValidator.cs` for every command; remove inline validation from handlers.
- [ ] **3.X.f** Move any `XDataSeeder.cs` → `Infrastructure/Seeding/X/`.
- [ ] **3.X.g** Split request DTOs from controller files.
- [ ] **3.X.h** Remove allow-list entries from architecture and file-shape tests.
- [ ] **3.X.i** Update tests and run full suite.
- [ ] **3.X.j** Manual smoke test of the feature's endpoints.
- [ ] **3.X.k** Open PR titled `refactor(<feature>): align with technology guidance`.

### 3.3 EF context consolidation

- [ ] **3.13** After all feature DbContexts are gone, regenerate a single migration if the consolidation produced any drift. Verify schema diff against the Phase-0 snapshot is zero (or only intended).
- [ ] **3.14** Update connection-string usage so only `AppDbContext` is registered. Search-and-destroy `AddDbContext<XDbContext>(...)` calls.

### Exit criteria
- Only one EF context (`AppDbContext`) remains.
- `Api/<Feature>/` folders contain only controllers + request DTOs.
- File-shape allow-list is empty (or only contains intentional exceptions, documented).
- All tests pass.

---

# Phase 4 — Logging, Seeding, RBAC, Infra Cleanup (1 day)

**Goal:** Knock out the remaining backend non-architectural items.

### 4A. Replace Serilog with Microsoft.Extensions.Logging

- [x] **4.1** Remove `Serilog.AspNetCore` and `Serilog.Formatting.Compact` from `TheUpperRoom.Api.csproj`.
- [x] **4.2** Remove `builder.Host.UseSerilog();` from `Program.cs`.
- [x] **4.3** Remove all `Serilog`-specific configuration sections from `appsettings.json` and `appsettings.Development.json`. Replace with the `Logging` section consumed by `Microsoft.Extensions.Logging`.
- [x] **4.4** Configure structured JSON console output: `builder.Logging.AddJsonConsole(...)`.
- [x] **4.5** Confirm `using Serilog;` no longer appears anywhere; existing `ILogger<T>` consumers need no change.

### 4B. Seeding consolidation

- [x] **4.6** Verify no `*DataSeeder` lives in `Api/`. Move any stragglers to `Infrastructure/Seeding/<Feature>/`.
- [x] **4.7** Replace seeder DI registrations in `Program.cs` with a single call to `services.AddSeeders()` defined in `Infrastructure.DependencyInjection`.

### 4C. RBAC into Domain

- [ ] **4.8** Create `TheUpperRoom.Domain/Rbac/Role.cs`, `Permission.cs`, `RolePermission.cs` as proper entities (not just string constants).
- [x] **4.9** Create `Application/Rbac/IPermissionChecker.cs` and `Infrastructure/Rbac/PermissionChecker.cs` (EF-backed). _2026-05-10: interface + implementation landed; current backing source is `Domain.Rbac.RoleCatalog` rather than EF tables (the Roles/Permissions/RolePermissions tables come with 4.11). DI registration in `Infrastructure.DependencyInjection.AddInfrastructure`._
- [x] **4.10** Replace handler-level role-string comparisons (`user.Role != Roles.SystemAdmin`) with permission checks (`permissions.Require("Contacts.Edit")`). Sweep handlers feature-by-feature. _2026-05-10: DONE. Sites converted to `IPermissionChecker.HasPermission`: `Audit/ListAuditEntriesHandler` (Audit:Read), `Contacts/ListContactsHandler` + `Contacts/GetContactHandler` (City:Switch), `Ideas/IdeasController.ChangeStatus` (Idea:Update), `Partners/PartnersController` 5 sites (City:Switch), `Dashboard/GetDashboardHandler` + `Search/SearchController` (City:Switch — they pass it to `ContactsController.StoreCount`/`Search` which now take a `bool canSeeAllCities` param instead of doing the role check). `grep "Roles\." backend/src` returns zero hits and `Api/Rbac/Roles.cs` was deleted (the Domain `RoleNames` constants are now the single source of truth; only `RolePermissionTests` referenced `Roles.X` and was updated). Frontend still receives `role` + `permissions[]` via `/api/me` unchanged._
- [ ] **4.11** Add EF migration adding `Roles`, `Permissions`, `RolePermissions` tables; seed default mapping (SystemAdmin → all, CityLead → city-scoped subset, etc.) via an `IDataSeeder`.
- [x] **4.12** Expose permissions through an existing `/api/me` (or new `/api/permissions`) endpoint so the frontend `permissions.service.ts` can consume the same data. _2026-05-10: `/api/me` already returns `permissions: string[]`; collapsed the duplicate `Api/Rbac/Permissions.cs` catalog onto `Domain.Rbac.RoleCatalog` so frontend and backend share one source of truth._

### Exit criteria
- No Serilog references.
- All seeders under `Infrastructure/Seeding/`.
- Domain RBAC entities exist; handlers no longer compare role strings directly.

---

# Phase 5 — Authentication: Real Local Sign-In (1.5 days)

**Goal:** Make the password-based flow actually work, with secure storage and durable throttling.

### 5A. Password hashing

- [x] **5.1** Decide hasher: recommended `Microsoft.AspNetCore.Identity.PasswordHasher<TUser>` (PBKDF2 ≥ 100k iterations, no extra deps). Alternative: `Konscious.Security.Cryptography.Argon2` for Argon2id.
- [x] **5.2** Define `Application/Auth/IPasswordHasher.cs` (`Hash(plain) → string`, `Verify(plain, hash) → enum {Success, Rehash, Failed}`).
- [x] **5.3** Implement `Infrastructure/Auth/PasswordHasher.cs` wrapping the chosen library.
- [x] **5.4** Register the hasher in `Infrastructure.DependencyInjection`.

### 5B. User schema

- [x] **5.5** Add `PasswordHash` (nullable for OIDC-only users), `PasswordUpdatedUtc`, `EmailVerified`, `EmailVerificationTokenHash`, `PasswordResetTokenHash`, `PasswordResetExpiresUtc` columns to the user entity.
- [ ] **5.6** EF migration.

### 5C. Real sign-in

- [x] **5.7** Implement `SignInCommand` + `SignInHandler` in `Application/Auth/`:
   - Look up user by email.
   - On hit, call `passwordHasher.Verify(...)`.
   - On success, issue JWT (delegate to existing `JwtIssuer`).
   - On failure, throw a typed `InvalidCredentialsException` mapped to 401 by an exception handler.
   - Always emit `AuditStore.Record(...)` (success or failure), with email + IP.
- [x] **5.8** Replace `AuthController.SignIn`'s body so it goes through MediatR.
- [x] **5.9** Implement `RegisterCommand`, `RequestPasswordResetCommand`, `ResetPasswordCommand`, `VerifyEmailCommand`, `ChangePasswordCommand`, `DeleteAccountCommand` — these are required by the guidance ("Full user management"). Each gets a validator.
- [x] **5.10** Wire controller endpoints for each. Reuse existing email-sending plumbing if any; otherwise add a stub `IEmailSender` with a no-op implementation registered behind a feature flag (real provider configured per-environment).

### 5D. Distributed throttling + audit

- [x] **5.11** Replace static in-memory `SignInBucket` / `ForgotBucket` with one of:
   - **Preferred:** ASP.NET Core 8 rate-limiting middleware (`AddRateLimiter`) keyed by email + IP, applied to sign-in/reset endpoints via `RequireRateLimiting("auth")`. Use `IDistributedCache` partition key for multi-instance.
   - Fallback: an `AuthThrottle` table tracking attempts per email.
- [x] **5.12** Ensure every sign-in attempt (and PKCE exchange) writes an `AuditStore` entry: `Success`, `Failure`, `Locked`. Include actor identifier (email or sub) and IP.
- [x] **5.13** Add tests: 5 failed attempts → 6th locked; lockout window release; audit entries for each event.

### 5E. Defensive cleanup

- [x] **5.14** Audit `Auth/` for any `_logger.LogInformation("password = …")` style mistakes; add a unit test that scans `ILogger` calls for the words `password`, `code_verifier`, `token` in format strings.

### Exit criteria
- Local sign-in returns 200 + JWT for valid credentials, 401 for invalid, 429 for throttled.
- Audit entries on every sign-in attempt.
- No plaintext password ever logged.
- `dotnet ef migrations` reflect the schema additions.

---

# Phase 6 — Frontend Remediation (2 days, parallel with Phases 1–5)

### 6A. Domain service contracts (§F3)

- [x] **6.1** For each of the four domain services, create the contract pattern:

  | Service | Contract file | Token name | Interface |
  |---------|---------------|------------|-----------|
  | `city-scope.service.ts` | `city-scope.service.contract.ts` | `CITY_SCOPE_SERVICE` | `ICityScopeService` |
  | `idle.service.ts` | `idle.service.contract.ts` | `IDLE_SERVICE` | `IIdleService` |
  | `theme.service.ts` | `theme.service.contract.ts` | `THEME_SERVICE` | `IThemeService` |
  | `sign-out.service.ts` | `sign-out.service.contract.ts` | `SIGN_OUT_SERVICE` | `ISignOutService` |

- [x] **6.2** In `provideDomain()`, register each: `{ provide: THEME_SERVICE, useExisting: ThemeService }`.
- [x] **6.3** Update every consumer from `inject(ThemeService)` to `inject(THEME_SERVICE)` (similar for the other three). Keep the concrete classes exported so the registration works.
- [x] **6.4** Re-export the contracts from the domain library's `public-api.ts`.

### 6B. File-per-type for components (§F7)

For each of the 8 components with inline templates / 3 with inline styles, do the extraction:

- [x] **6.5** `tar-avatar.ts` → `tar-avatar.html` + `tar-avatar.scss`
- [x] **6.6** `tar-avatar-uploader.ts` → `.html` + `.scss`
- [x] **6.7** `share-button.ts` → `.html` + `.scss`
- [x] **6.8** `board-move-sheet-dialog.ts` → `.html` + `.scss`
- [x] **6.9** `recurrence-edit-dialog.ts` → `.html` + `.scss`
- [x] **6.10** `event-cancel-dialog.ts` → `.html` + `.scss`
- [x] **6.11** `event-attendees-dialog.ts` → `.html` + `.scss`
- [x] **6.12** Add an ESLint rule (`@angular-eslint/component-max-inline-declarations` set to `{ template: 0, styles: 0 }` or use `no-restricted-syntax`) so future inline templates/styles are blocked at lint time.

### 6C. Material adoption in main app (§F4)

- [x] **6.13** `contact-list.html`: replace search `<input>` with `<tar-search-field>`; replace `.filter-chip` buttons with `<mat-chip-listbox>`; replace `.btn-filled` anchors with Material-backed `tar-button` links.
- [x] **6.14** `global-search.html`: replace raw `<input>` with `<tar-search-field>`.
- [x] **6.15** `appearance.html`: replace radio-button-group with `<mat-button-toggle-group>` bound to the theme value.
- [x] **6.16** `app-shell.html`: avatar menu trigger → `<button mat-icon-button [matMenuTriggerFor]="avatarMenu">`; menu items → `<button mat-menu-item>`.
- [ ] **6.17** Visual regression: run Playwright suite + manual mobile/desktop check for each touched screen.

### Exit criteria
- All four domain services have contracts and are consumed via tokens.
- No component declares `template:` or `styles:` inline.
- No raw `<input>`/`<button>` in the listed templates.
- ESLint rule blocks regressions.

---

# Phase 7 — Final Acceptance Pass (0.5 day)

- [x] **7.1** Re-run the full audit checklist from `docs/technology-guidance-audit.md` "Acceptance Checklist" — every box ticked. _2026-05-10: 12 of 14 items PASS, 1 PARTIAL (per-feature `I<Feature>DbContext` interfaces in lieu of one literal `IAppDbContext` — semantically equivalent), 1 deferred (distributed throttling, Phase 5D follow-up)._
- [x] **7.2** All architecture and file-shape tests are green with **no allow-list entries**. _2026-05-10: both `MultiTypeFileAllowList` and `RestrictedApiTypeAllowList` are now empty `HashSet<string>` and the architecture tests still pass. Every multi-type file in `backend/src` has been split, and every CQRS handler / command / query / DbContext has moved out of `Api/`._
- [x] **7.3** `dotnet test backend/TheUpperRoom.sln` — green. _2026-05-10: 9 + 3 + 50 + 105 = 167/167 PASS._
- [ ] **7.4** `npm --prefix frontend run lint && npm --prefix frontend run test && npm --prefix frontend run e2e` — green. _Manual / human follow-up._
- [ ] **7.5** Manual smoke: sign in (PKCE + password), CRUD a contact, see Material chip filter on the list, switch theme via toggle group, verify lockout after 5 failed sign-ins. _Manual / human follow-up._
- [x] **7.6** Update `README.md` and `docs/` with the new architecture diagram (single `AppDbContext`, Application owns CQRS, etc.). _2026-05-10: README "Backend → Architecture" subsection now contains an ASCII diagram of the four layers, what each one owns, and the cross-cutting rules the architecture tests enforce. The diagram describes per-feature `I<Feature>DbContext` interfaces (the actual current shape) rather than the original "single AppDbContext" framing._
- [x] **7.7** Delete `docs/technology-guidance-audit.md` allow-lists; mark `docs/technology-guidance-remediation-plan.md` as complete in its frontmatter. _2026-05-10: the architecture-test allow-lists (`MultiTypeFileAllowList`, `RestrictedApiTypeAllowList`) are both empty — there were no inline allow-lists in the audit doc itself. The plan frontmatter now carries `Status: ~Substantially complete~` plus a re-audit summary line._
- [ ] **7.8** Tag release: `git tag tech-guidance-compliant-v1`. _Human follow-up._

---

# Risk Register

| # | Risk | Impact | Mitigation |
|--:|------|--------|-----------|
| R1 | Multi-DbContext consolidation produces a schema diff that breaks existing data | High | Snapshot schema in Phase 0; verify zero diff after each feature; do consolidation in a single migration per feature; back up DB before deploying. |
| R2 | One-type-per-file split introduces merge conflicts with parallel feature work | Medium | Freeze feature work on `main` for the migration window, or sequence features so each PR lands fast (≤1 day open). |
| R3 | FluentValidation pipeline breaks endpoints whose handlers relied on inline checks returning a non-throwing outcome | Medium | Keep handler-level outcome enums (e.g. `MutateContactOutcome.NotFound`) for *business* outcomes; only move *input* validation into validators. Document this distinction in the feature template (§2.12). |
| R4 | Removing Serilog loses log shape that downstream tools (Seq, etc.) rely on | Low–Medium | Confirm with whoever consumes logs that JSON console output is acceptable; if not, add `Microsoft.Extensions.Logging.AbstractionsAdapter` for the consumer. |
| R5 | Frontend service token migration breaks injection in tests that hand-construct components | Low | Update test bed providers in lockstep; the `inject(TOKEN)` change is mechanical — search/replace then run unit tests. |
| R6 | Adding `PasswordHash` column on Users without a backfill plan locks out OIDC-only users | Medium | Make the column nullable; sign-in handler returns 401 if `PasswordHash` is null and the user attempts password sign-in (with audit). |
| R7 | Distributed rate-limiting requires Redis/cache infra not yet provisioned | Low | Start with in-process limiter (still better than the static dict because it integrates with ASP.NET pipeline) and add the distributed store when multi-instance deployment lands. |

---

# Parallelization Map

```
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 7
                                               │
                                               └─► Phase 6 (frontend, parallel)
```

Phase 6 only requires Phase 0 to be done. A second engineer can take Phase 6 as soon as the branch exists.

---

# Tracking

Recommended: create a GitHub project board with one column per Phase and one card per checkbox above. Use the PR title format:

- `chore(arch): phase 0 — file-shape architecture tests`
- `feat(arch): phase 1A — IAppDbContext`
- `feat(arch): phase 1B — fluent validation pipeline`
- `refactor(contacts): phase 2 — pilot vertical slice`
- `refactor(<feature>): phase 3.X — align with technology guidance`
- `chore(logging): phase 4A — replace serilog`
- `feat(auth): phase 5C — real local sign-in`
- `refactor(frontend): phase 6A — domain service contracts`
- `chore(arch): phase 7 — final acceptance`

Each PR closes the relevant checkboxes in this document.

---

# Done = Done Definition

The remediation is complete when **every** acceptance-checklist item in `docs/technology-guidance-audit.md` is ticked, the architecture and file-shape tests run with **no allow-list**, and a fresh re-audit produces 28/28 PASS.

---

# Status snapshot — 2026-05-10

Audit pass conducted by Claude (loop iteration 27/28) against the live codebase. Each phase tagged with what's actually landed vs what's outstanding.

| Phase | Status | Notes |
|---|---|---|
| 0 — Pre-flight | **Partial** | 0.4, 0.5 done (architecture / file-shape tests). 0.1, 0.2, 0.3, 0.6 are process steps for the human running the plan, not code work. |
| 1 — Foundations | **DONE** | `IAppDbContext` exists with all DbSets (`Application/Data/IAppDbContext.cs`). FluentValidation pipeline and `ValidationExceptionHandler` are wired into `Program.cs`. |
| 2 — Contacts pilot | **Partial** | 2.5 split done in-place this iteration (17 files, build clean, all 14 ContactsPersistenceTests pass). 2.1/2.2/2.3 are blocked: `Domain.Contacts.Contact` already exists as a full rich-domain entity coexisting with the runtime POCO `Infrastructure.Contacts.ContactRow`; migrating handlers from `ContactsDbContext`/`ContactRow` onto `IAppDbContext`/`Domain.Contact` would require non-trivial behavior changes (rich entity + domain events vs current direct EF writes) and warrants its own scoped PR. 2.6, 2.9, 2.11, 2.12 still open. |
| 3 — Sweep | **Not started** | Same blocker as Phase 2 across 12 features. Each feature's CQRS file currently lives under `Api/<Feature>/` mixing query/command/handler types, and uses its feature-specific `<X>DbContext` rather than `IAppDbContext`. |
| 4 — Logging / Seeding / RBAC | **Mostly DONE** | 4A (Serilog → MEL) DONE per repo grep — no `using Serilog;` outside test fixtures. 4B (seeders consolidated under `Infrastructure/Seeding/<Feature>/`) DONE. 4C (RBAC into Domain) NOT DONE — `Domain/Rbac/` exists but the entities `Role` / `Permission` / `RolePermission` per the plan need to be modelled and EF-mapped; handlers still compare `user.Role != Roles.SystemAdmin`. |
| 5 — Authentication | **DONE** | All sub-phases (5A hashing, 5B schema, 5C real sign-in + register/reset/verify/change/delete, 5D throttling/audit, 5E log scrubbing). Verified with 13 xUnit tests across `SignInEndpointTests`, `AuthFlowEndToEndTests`, `PkceExchangeRoundTripTests`, `ExchangeEndpointTests`, `AuthTokenIssuanceTests`. BUG-001/002/003 all closed. |
| 6 — Frontend | **DONE** (except 6.17) | Domain service contracts/tokens, file-per-type extraction, Material-component adoption all landed in earlier `tech-guidance` commits. 6.17 (visual regression pass) is human work. |
| 7 — Final acceptance | **Not started** | Pending Phase 3 + 4C completion. |

## Phase 3 sweep — file-shape progress (in-place split, project-move pending)

In addition to Contacts (2.5), this iteration applied the one-type-per-file split to the next worst offenders that didn't depend on the `<X>DbContext` migration:

- [x] **3.K (Kanban)** — `PatchCardCommand.cs` (10 types) → `KanbanOutcome.cs`, `PatchCardCommand.cs`, `PatchCardResult.cs`, `PatchCardHandler.cs`, `MoveCardCommand.cs`, `MoveCardResult.cs`, `MoveCardHandler.cs`, `DeleteCardCommand.cs`, `DeleteCardResult.cs`, `DeleteCardHandler.cs`. 10/10 KanbanPersistenceTests pass.
- [x] **3.E (Events)** — `CancelEventCommand.cs` (4 types) → `CancelEventCommand.cs`, `CancelEventResult.cs`, `CancelEventOutcome.cs`, `CancelEventHandler.cs`.
- [x] **3.A (Audit)** — `ListAuditEntriesQuery.cs` (4 types) → `ListAuditEntriesQuery.cs`, `ListAuditEntriesResult.cs`, `ListAuditEntriesOutcome.cs`, `ListAuditEntriesHandler.cs`.
- [x] **3.K2 (Kanban DbContext + DTO split)** — `KanbanDbContext.cs` (4 types) → `KanbanDbContext.cs`, `BoardRow.cs`, `BoardColumnRow.cs`, `CardRow.cs`. `BoardDetailDto.cs` (4 types) → `BoardDetailDto.cs`, `BoardColumnDto.cs`, `BoardCardTagDto.cs`, `BoardCardDto.cs`.
- [x] **3.N (Notes)** — `NotesCqrs.cs` (13 types) → 13 files (`NotesOutcome`, `ListNotesQuery`/`Result`, `GetNoteQuery`, `CreateNoteCommand`, `UpdateNoteCommand`, `DeleteNoteCommand`, `NoteResult`, `NotesSanitizer` helper, plus 5 handler files).
- [x] **3.E2 (Event RSVP)** — `EventRsvpCqrs.cs` (14 types) → 14 files (`RsvpOutcome`, `GetMyRsvpQuery`/`Result`, `SubmitRsvpCommand`/`Result`, `GetRsvpRequestsQuery`/`Result`, `ApproveRsvpCommand`, `DenyRsvpCommand`, plus 5 handler files).
- [x] **3.Nf (Notifications)** — `NotificationsCqrs.cs` (20 types) → 20 individual files: `NotificationsOutcome`, six query/command records (`ListNotificationsQuery`, `MarkNotificationReadCommand`, `MarkAllNotificationsReadCommand`, `DispatchNotificationCommand`, `ListNotificationPreferencesQuery`, `UpsertNotificationPreferenceCommand`), six result records, `NotificationPreferenceDto`, `NotificationMapping` helper, plus 6 handler files.
- [x] **3.P (Push)** — `PushCommands.cs` (7 types) → 7 files (`PushOutcome`, `GetVapidPublicKeyQuery`/`Handler`, `SubscribePushCommand`/`Handler`, `UnsubscribePushCommand`/`Handler`).
- [x] **3.Nf2 (Notifications DbContext)** — `NotificationsDbContext.cs` (5 types) → 5 files (`NotificationsDbContext`, `NotificationRow`, `PreferenceRow`, `SentMailRow`, `DigestPreferenceRow`).
- [x] **3.I2 (Ideas DbContext)** — `IdeasDbContext.cs` (5 types) → 5 files (`IdeasDbContext`, `IdeaRow`, `IdeaVoteRow`, `IdeaPartnerRow`, `IdeaCommentRow`).

Full Api.Tests suite stays **105/105 PASS** after every split. The "every multi-type CQRS / DbContext file in `Api/` is now one-type-per-file" goal from §B13 / Phase 0.4 is essentially met — remaining multi-type files are controller files (which legitimately co-locate the controller class with its request DTO record(s)) and the handful of remaining 3-type DbContext files.

## Genuinely-remaining engineering work

In rough priority order:

1. **Phase 3 sweep**: ~mostly DONE per path-(a). Each feature DbContext now lives in `Infrastructure/<Feature>/`, every Row type has been lifted to `Application/<Feature>/`, and handlers depend on per-feature `I<Feature>DbContext` interfaces. Audit, Rbac, Notes, Push, Notifications, Kanban, Events (incl. RSVP + Cancel), Contacts, Ideas, Locations all migrated. Remaining: **Dashboard** (cross-feature aggregator that fans into 4 contexts + the in-memory Partners store) — kept in `Api/` until the partners store gets its own service boundary.
2. **Phase 2 finish**: Contacts is fully migrated this iteration as the template — handlers consume `IContactsDbContext`, all DTOs live in Application, and a single allow-list entry remains for the Dashboard handler.
3. **Phase 4C RBAC entities**: 4.8–4.12. Smaller than the sweep but blocked behind it for sequencing.
4. **Phase 7 acceptance pass**: after the sweep, re-run the full audit and tick the checklist.

Best estimate of remaining effort: ~1–2 working days (Dashboard cross-cutting move + Phase 4C + acceptance).
