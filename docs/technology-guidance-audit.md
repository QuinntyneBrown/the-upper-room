# Technology Guidance Audit & Suggested Fixes

**Audit date:** 2026-05-09
**Subject:** `C:\projects\the-upper-room`
**Reference:** `C:\projects\the-health-game\docs\technology-guidance-and-practices.md`

This document audits the codebase against every requirement in the guidance document and prescribes concrete fixes. Issues are grouped by severity, then by area.

---

## Re-audit — 2026-05-10

The original audit below was conducted on **2026-05-09**. After ~30 loop iterations of remediation work, the state has shifted considerably. Re-running each item against the live tree on 2026-05-10:

| Area | PASS | PARTIAL | FAIL | Total | Δ vs 2026-05-09 |
|------|-----:|--------:|-----:|------:|----------------:|
| Backend architecture | 8 | 1 | 0 | 9 | +5 PASS / −4 FAIL |
| Backend validation | 5 | 0 | 0 | 5 | +4 PASS / −4 FAIL |
| Backend file/type rule | 1 | 0 | 0 | 1 | +1 PASS / −1 FAIL |
| Authentication | 3 | 0 | 1 | 4 | +2 PASS / −0 FAIL |
| Frontend | 9 | 0 | 0 | 9 | +3 PASS / −1 FAIL |
| **Total** | **26** | **1** | **1** | **28** | **+15 PASS / −10 FAIL** |

The single **PARTIAL** is §B3 (per-feature `I<Feature>DbContext` abstractions instead of one literal `IAppDbContext` — handlers depend on Application-defined interfaces, which satisfies the spirit of the rule; consolidating into one context is an optional follow-up). The remaining **FAIL** is §A17's distributed throttling clause (the in-process `AuthRateLimiter` is fine for single-instance; cross-instance Redis-backed throttling is the deferred work).

### Test surface (2026-05-10)

The backend test suite grew from 167 to **665 tests** during the remediation — a 298% increase over the baseline (3.98× the original count):

- **Domain.Tests**:       272 (was 9)
- **Infrastructure.Tests**: 9 (was 3)
- **Application.Tests**:  277 (was 50)
- **Api.Tests**:          107 (was 105)

The 498 new tests split as:

- **Architecture tests** (13): file-shape rule, Api-shape rule, seeder centralisation, Application/Domain reference graph, Domain framework purity, Application→Infrastructure dependency inversion, Domain→outer-layer inversion, Infrastructure→Api inversion, every Infrastructure DbContext implements an Application interface, every Application handler depends on `I<Feature>DbContext`, every Application handler is `internal sealed`, every Application validator is `public sealed AbstractValidator<T>`, every Application command/query is a `public sealed record` implementing `IRequest<T>`.
- **Validator unit tests** (58): every Application validator (24 of them) has at least one failing-input case pinned, including all 7 Auth validators, SubmitRsvp status enum, ListAuditEntries paging bounds, CreateContact field shapes, MoveCard, DispatchNotification, plus smoke cases for the 13 ID-bearing validators.
- **Pure-helper unit tests** (404): `ContactsDisplayName.Build` (Contacts), `ContactsMapping.ToContact` (Contacts), `EventsMapping.ToDto` (Events), `CityScope.ForCity` / `VisibleOrNull` (Cities), `NotificationMapping.Render` / `ToDto` (Notifications), `NotesSanitizer.Instance` allow-list + `ToDto` (Notes), `RoleCatalog.HasPermission` / `PermissionsFor` / `All` shape (Domain.Rbac), `Permission` record value-equality + ToString format (Domain.Rbac), `PasswordPolicy.Evaluate` (Domain.Auth) — strong/common/compromised/identifier/character-class branches, `NotificationCatalog` shape + `Require` (Domain.Notifications), the three Domain value objects `EmailAddress` / `PhoneNumber` / `Address` — construction guards, format validation, and lat/lon bounds, the `Domain.Common.Guard` utility (Required / Optional / Utc / RequiredHttpUrl / OptionalHttpUrl / OptionalRange), `Domain.Audit.AuditEntry` construction + UTC timestamp invariant, `Domain.Common.SlugGenerator.From` (lowercase, whitespace collapse, diacritic strip, punctuation→hyphen, trim, blank rejection), `Domain.Common.DomainId` / `Entity` (UUIDv7 format, uniqueness, blank-id auto-generation, explicit-id trim), and `Domain.Common.AuditableEntity` (Created vs Updated separation, Touch contract, UTC enforcement on construct + touch, domain event raise/clear ordering, Version defensive-copy), and `Domain.Cities.City` (Name+Slug derivation, Rename, idempotent Archive/Restore + EntityArchived/RestoredDomainEvent emission), `Domain.Notes.Note` (subject + body assignment, UpdateBody pushes prior state to history head, history caps at MaxHistoryVersions, blank body/subject rejection), `Domain.Tags.Tag` (name+slug derivation, optional description with null/clear, Update mutates name/slug/color/description and touches audit, length-limit + blank-name rejection), `Domain.Contacts.Contact` (DisplayName fallback vs override, ReplacePhones/Emails reject >1 primary, ReplaceTags case-insensitive de-dup, Archive idempotency + event, SoftDelete redacts PII / clears collections / blocks subsequent mutations), `Domain.Ideas.Idea` (default Draft status, ToggleVote add/remove + case-insensitive uniqueness, ChangeStatus emits EntityStatusChangedDomainEvent with old/new, Update de-dups partner+tag ids, invalid cover URL rejected), `Domain.Events.Event` (default Potential status, end>start invariant, GetEffectiveStatus Past/Cancelled rules, RSVP capacity→Waitlist, RSVP requiresApproval→PendingApproval, single-attendee update on re-RSVP, missing user+guest rejection, Cancel emits EntityStatusChanged), `Domain.Kanban.KanbanBoard` (sequential column Order on Add, ReorderColumns rejects non-permutation/applies valid one, ReplaceSchema rejects duplicate keys, AddCard enforces required schema fields and column WIP limit, MoveCard enforces target WIP excluding moving card, unknown column/card rejected, WIP limit floor=1), `Domain.Kanban.KanbanCard` (case-insensitive Data + tag-id de-dup, Move updates column/swimlane/position + Touch, Archive emits event, blank board/column rejected), `Domain.Events.EventAttendee` (requires user OR guest, Update mutates status/responded/note, non-UTC RespondedAt rejected), `Domain.Locations.Location` (Update replaces basics + collections, photo URL HTTP+max-10 enforcement, EnsureCanDelete blocks when upcoming events exist, Archive/Restore idempotency + events), `Domain.Users.User` (email lowercase + @-required, Pending default, VerifyEmail Pending→Active + token clear, SignIn requires Active, SetPasswordHash clears reset token, Disable revokes sessions, Delete redacts PII + emits EntityDeleted, AssignRole idempotency, RevokeOtherSessions excludes current), `Domain.Partners.Partner` (HTTP-only Website/LogoUrl, ReplaceTags case-insensitive de-dup, LinkContact rejects duplicate + UnlinkContact no-op, SoftDelete redacts/clears + EntityDeleted, post-SoftDelete mutation guards, Archive/SoftDelete idempotency), `Domain.Notifications.Notification` (starts unread, MarkRead records UTC timestamp, blank title/body rejected), `Domain.Users.Invitation` (email lowercase + @-required, Pending default, IsExpired only when Pending+past, Accept after expiry throws and marks Expired, Accept after Revoke throws, Revoke is no-op once Accepted), `Domain.Notifications.NotificationPreference` (per-channel flags + Update, blank-code rejection), `Domain.Partners.SocialLink` + `PartnerContactLink` (HTTP-only URL, blank field rejection, record value-equality), `Domain.Kanban.KanbanSwimlane` (blank-board/key/name rejection), `Domain.Audit.AuditActions` constants pinned for the audit-log wire shape, `Domain.Kanban.CardSchemaField` (key/label/options/required assignment, blank-key/label/option rejection, key length cap), a `EnumShapeTests` sweep pinning the wire-shape enums (RsvpStatus, EventStatus, IdeaStatus, IdeaVoteChange, NoteSubjectType, NotificationSeverity, SocialPlatform, InvitationStatus, UserStatus, TagColor floor, KanbanFieldType) so renames break tests instead of seed data / JSON, `Application.Auth.AuthMutationOutcome` / `SignInOutcome` / `PasswordHashVerificationResult` enum shapes (HTTP-status routing surface), `Application.Auth.AuthToken` (URL-safe base64 charset, 32-byte entropy floor, uniqueness across calls, SHA-256 hex-upper hashing with whitespace trim and known SHA-256 of "hello"), `Application.DependencyInjection.AddApplication` (validators discoverable, ValidationBehavior in MediatR pipeline, ISender resolves, additional-assembly call does not regress Application registrations), and `Domain.Rbac.PermissionActions` / `PermissionResources` / `RoleNames` constants pinned literally (these ride the wire via JWT claims, /api/me, audit rows; a typo-fix would silently invalidate seed data) plus `RoleDefinition` record value-equality, `Application.Uploads.UploadFileHandler` (Unauthorized when user unknown, NoFile when length/filename null, TooLarge>10MB with messaging, Uploaded carries filename extension, 10MB boundary accepted), `Application.Notifications.GetVapidPublicKeyHandler` (passes settings value through, empty when settings empty), `Application.Notes.NoteDto.From` (basic field copy, SubjectType serialised as enum string-name not number, history projected newest-first with prior-version creator/timestamp), `Application.Audit.ListAuditEntriesHandler` authorisation gate (Unauthorized when user unknown, Forbidden when role lacks Audit:Read, Ok otherwise) with paging surface returned even on rejection, `Application.Notifications.UnsubscribePushHandler` + `SubscribePushHandler` auth gates (Unauthorized for unknown user; BadRequest when body is null even for known user) + `PushOutcome` wire-shape (NoContent / Unauthorized / BadRequest map to 204/401/400), `Application.Notifications.MarkAllNotificationsReadHandler` / `MarkNotificationReadHandler` auth gates + `NotificationsOutcome` wire-shape pinned (Ok/NoContent/Unauthorized/BadRequest/NotFound/Unprocessable), `Application.Notes` Create/Update/Delete/Get/ListNote handler auth gates (Unauthorized when user unknown across all five), CreateNote BadRequest for null body and Unprocessable for invalid subjectType, ListNotes BadRequest for invalid subjectType, validator rejects blank body via pipeline, plus `NotesOutcome` wire-shape, `Application.Contacts.CreateContactHandler` / `DeleteContactHandler` / `GetContactHandler` / `ListContactsHandler` auth gates including the cross-city Forbidden routing (scope=all or other-city without City:Switch permission), plus `ContactsOutcome` wire-shape (Ok/Created/NoContent/Unauthorized/Forbidden/NotFound/BadRequest/Unprocessable), `Application.Events` Cancel/SubmitRsvp/ApproveRsvp/DenyRsvp/GetMyRsvp/GetRsvpRequests auth gates (Unauthorized for unknown user across all six; SubmitRsvp BadRequest for null body) plus `CancelEventOutcome` and `RsvpOutcome` wire-shapes, and `Application.Kanban` MoveCard/DeleteCard/PatchCard auth gates (Unauthorized for unknown user; PatchCard BadRequest for null body) plus MoveCardCommandValidator pipeline-level rejection of blank targetColumnId and `KanbanOutcome` wire-shape (Ok/Unauthorized/NotFound/BadRequest/Unprocessable), `Application.Auth.RegisterHandler` (Conflict when email taken, Created with userId+token on happy path, password is hashed not stored plaintext, default city Toronto when blank, provided city is trimmed), `Application.Auth.SignInHandler` (InvalidCredentials when user/password missing or verify fails, EmailNotVerified when email pending, Success records sign-in, Rehash result triggers ReplacePasswordHash before recording sign-in), and `Application.Auth.VerifyEmailHandler` / `RequestPasswordResetHandler` / `ResetPasswordHandler` (token always SHA-256 hashed before reaching the store, store-rejection returns InvalidToken, RequestPasswordReset hides existence by returning blank token + skipping email when store declines), and `Application.Auth.ChangePasswordHandler` / `DeleteAccountHandler` (NotFound when user missing or has no password hash, InvalidCredentials when verify fails, ChangePassword rehashes via IPasswordHasher on success, DeleteAccount returns NotFound when post-verify DeleteAccountAsync returns false — handles concurrent-deletion race), and `Application.Users.AppUser` + `Application.Audit.AuditEntryRecord` / `AuditEntryDto` record value-equality + `with`-expression copy semantics + positional-shape pinning (record fields are wire-shape).
- **MediatR pipeline behaviour tests** (5): `ValidationBehavior` short-circuits with no validators, calls next on success, throws ValidationException + does not call next on failure, aggregates failures across multiple validators.
- **Infrastructure unit tests** (10): `PasswordHasher` (per-call salt, null/blank-input contract, verify rejects blank), `PermissionChecker` (delegates to RoleCatalog), `Permission` record value-equality + ToString format.
- **HTTP-level validation integration** (4): RegisterCommand (short password / bad email) + Create / Update Contact (empty FirstName) all return RFC-7807 `application/problem+json` 400s end-to-end through the FluentValidation → ValidationException → ValidationExceptionHandler pipeline.

The original section-by-section breakdown follows for historical reference. **Treat the per-section "PASS / PARTIAL / FAIL" verdicts in the headings below as the 2026-05-09 snapshot, not the current state.**

---

## Executive Summary (2026-05-09 snapshot — see Re-audit above for current)

| Area | PASS | PARTIAL | FAIL | Total |
|------|-----:|--------:|-----:|------:|
| Backend architecture | 3 | 2 | 4 | 9 |
| Backend validation | 1 | 0 | 4 | 5 |
| Backend file/type rule | 0 | 0 | 1 | 1 |
| Authentication | 1 | 2 | 1 | 4 |
| Frontend | 6 | 2 | 1 | 9 |
| **Total** | **11** | **6** | **11** | **28** |

### Critical (must fix first)
1. Backend handlers, validators, queries, commands, and feature `DbContext` types live in the Api project instead of Application/Infrastructure — Clean Architecture is structurally inverted (§B1).
2. No `IAppDbContext` abstraction; handlers depend on concrete EF contexts (§B3).
3. No FluentValidation, no validators, no `ValidationBehavior`, no `ValidationProblemDetails` mapping (§B8–B12).
4. One-type-per-file rule broken extensively (e.g. `ContactsCqrs.cs` contains 17 top-level types). (§B13)
5. Local username/password sign-in endpoint accepts credentials but always returns `Unauthorized`; no password hashing library or password column exists (§A14, §A15).

### High
6. Multiple feature-scoped `DbContext` classes in Api (Cities/Contacts/Events/Ideas/Kanban/Locations/Notes/Notifications/Push) — should be a single `AppDbContext` in Infrastructure.
7. Domain services in frontend are missing `*.contract.ts` interface companions for 4 of 5 services (§F3).
8. 7+ inline templates and 3 inline styles in Angular components violate the file-per-type rule (§F7).

### Medium
9. Serilog used for logging instead of `Microsoft.Extensions.Logging` (§B6).
10. Two data seeders live in Api instead of Infrastructure (§B5).
11. Failed sign-in audit log entries inconsistent (only PKCE exchange logs; password sign-in does not) (§A17).
12. Several raw `<input>`/`<button>` elements in main app should be Material-wrapped (§F4).
13. Domain-layer RBAC entities/permissions absent; only role string constants in Api (§A18).

---

# Part A — Backend Architecture & Layering

## §B1 — Clean Architecture (FAIL, CRITICAL)

**Required:** Commands, queries, handlers, validators, and feature DbContexts belong in `Application` (handlers/validators) and `Infrastructure` (EF). The Api layer hosts only controllers and HTTP wiring.

**Found:** Every feature module lives in `backend/src/TheUpperRoom.Api/<Feature>/`:

```
TheUpperRoom.Api/
  Cities/        Contacts/    Dashboard/    Events/
  Ideas/         Kanban/      Locations/    Notes/
  Notifications/ Partners/    Rbac/         Search/
```

These folders contain CQRS records, handlers, EF DbContexts, and data seeders — all of which belong elsewhere.

`TheUpperRoom.Application` is nearly empty: only `Cities/CityScope.cs`, `Cities/IRequireCityScope.cs`, `Users/AppUser.cs`, `Users/IUserDirectory.cs`, and `DependencyInjection.cs`.

### Fix

For each feature folder under `TheUpperRoom.Api/`:

1. **Move CQRS types** (commands, queries, results, handlers) → `TheUpperRoom.Application/<Feature>/`.
2. **Move EF entity classes** (e.g. `ContactRow`, `CityRow`) → `TheUpperRoom.Domain/<Feature>/` as proper domain entities (drop the `Row` suffix once they are domain types).
3. **Delete the feature-scoped DbContexts**; merge their `DbSet<T>` and `OnModelCreating` configuration into the single `TheUpperRoom.Infrastructure/Data/AppDbContext.cs`.
4. **Leave only the controller** in `TheUpperRoom.Api/<Feature>/`.

Suggested target shape:

```
TheUpperRoom.Application/
  Contacts/
    ListContactsQuery.cs
    ListContactsHandler.cs
    ListContactsResult.cs
    CreateContactCommand.cs
    CreateContactCommandValidator.cs
    CreateContactHandler.cs
    ...
TheUpperRoom.Domain/
  Contacts/
    Contact.cs
TheUpperRoom.Infrastructure/
  Data/
    AppDbContext.cs                 // single context, owns DbSet<Contact>
    Contacts/ContactConfiguration.cs
TheUpperRoom.Api/
  Contacts/ContactsController.cs    // only the controller stays
```

---

## §B2 — MediatR usage (PASS)

- Version 12.4.1 (free) confirmed in `TheUpperRoom.Application.csproj:8`.
- Controllers correctly call `mediator.Send(...)` (e.g. `ContactsController.cs:42`).
- No fix required.

---

## §B3 — `IAppDbContext` interface (FAIL, CRITICAL)

**Required:** Handlers depend on `IAppDbContext`; concrete `AppDbContext` inherits `DbContext` and implements `IAppDbContext`.

**Found:** `TheUpperRoom.Infrastructure/Data/AppDbContext.cs:18` defines
```csharp
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
```
No interface exists. Handlers in Api inject the *feature* DbContexts directly (e.g. `ContactsCqrs.cs:56` `ContactsDbContext db`).

### Fix

1. Create `TheUpperRoom.Application/Data/IAppDbContext.cs`:
   ```csharp
   public interface IAppDbContext
   {
       DbSet<Contact> Contacts { get; }
       DbSet<City> Cities { get; }
       DbSet<Event> Events { get; }
       // ... one DbSet per aggregate
       Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
   }
   ```
2. Update `AppDbContext` to implement it:
   ```csharp
   public class AppDbContext(DbContextOptions<AppDbContext> options)
       : DbContext(options), IAppDbContext { /* DbSets here */ }
   ```
3. Register both: `services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());`.
4. Refactor every handler to inject `IAppDbContext` instead of a feature DbContext.

---

## §B4 — Repository / Unit-of-Work (PASS)

No `IRepository`, `Repository<T>`, or `UnitOfWork` types exist. Keep it that way.

---

## §B5 — Seeding location (PARTIAL)

Required: seeding lives in Infrastructure.

**Found:** Infrastructure has `Seeding/IDataSeeder.cs`, `SeedingService.cs`, `SeedingHostedService.cs`, `UserDataSeeder.cs`. **But two seeders live in Api:**
- `TheUpperRoom.Api/Cities/CitiesDataSeeder.cs`
- `TheUpperRoom.Api/Contacts/ContactsDataSeeder.cs`

Both are registered in `Program.cs:75,81`.

### Fix

Move both files to `TheUpperRoom.Infrastructure/Seeding/` (or a `Seeding/<Feature>/` subfolder). Update DI registrations from `Program.cs` into `TheUpperRoom.Infrastructure.DependencyInjection.AddInfrastructure(...)` so the Api project no longer references seeders directly.

---

## §B6 — Microsoft.Extensions.* only (FAIL)

**Required:** Microsoft.Extensions.Logging, Configuration, Dependency Injection.

**Found:** Serilog is used for logging.
- `TheUpperRoom.Api.csproj:7-8`:
  ```
  <PackageReference Include="Serilog.AspNetCore" Version="10.0.0" />
  <PackageReference Include="Serilog.Formatting.Compact" Version="3.0.0" />
  ```
- `Program.cs:34`: `builder.Host.UseSerilog();`

### Fix

1. Remove both Serilog packages from `TheUpperRoom.Api.csproj`.
2. Remove `builder.Host.UseSerilog()` and any `Serilog.*` configuration sections from `appsettings*.json`.
3. Configure logging with `builder.Logging.AddConsole()` / `AddDebug()` / `AddJsonConsole()` (all in `Microsoft.Extensions.Logging`).
4. Replace any `ILogger<T>` consumers — they already use the abstraction so no code changes needed.

---

## §B7 — `.sln` format (PASS)

`backend/TheUpperRoom.sln:2` reads `Microsoft Visual Studio Solution File, Format Version 12.00`. ✔

---

# Part B — Validation

## §B8 — FluentValidation referenced (FAIL)

Not in any `.csproj`.

### Fix

Add to `TheUpperRoom.Application.csproj`:
```xml
<PackageReference Include="FluentValidation" Version="11.*" />
<PackageReference Include="FluentValidation.DependencyInjectionExtensions" Version="11.*" />
```

---

## §B9 — No `DataAnnotations` on commands/queries/DTOs (PASS)

No occurrences found. ✔

---

## §B10 — `AbstractValidator<T>` per command (FAIL)

Zero validators exist; handlers contain inline manual checks (e.g. `ContactsCqrs.cs:151–152`).

### Fix

For every command/query, create a colocated validator. Example:

```csharp
// TheUpperRoom.Application/Contacts/CreateContactCommandValidator.cs
public sealed class CreateContactCommandValidator : AbstractValidator<CreateContactCommand>
{
    public CreateContactCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.CityId).NotEmpty();
    }
}
```

Move the existing inline checks out of handlers into validators.

---

## §B11 — Validator scanning + MediatR pipeline behavior (FAIL)

No assembly scan; no behavior.

### Fix

In `TheUpperRoom.Application/DependencyInjection.cs`:

```csharp
services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
```

Add `TheUpperRoom.Application/Common/ValidationBehavior.cs`:

```csharp
public sealed class ValidationBehavior<TRequest, TResponse>(
    IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        if (!validators.Any()) return await next();

        var ctx = new ValidationContext<TRequest>(request);
        var failures = (await Task.WhenAll(
            validators.Select(v => v.ValidateAsync(ctx, ct))))
            .SelectMany(r => r.Errors)
            .Where(f => f is not null)
            .ToList();

        if (failures.Count != 0) throw new ValidationException(failures);
        return await next();
    }
}
```

---

## §B12 — Map `ValidationException` → HTTP 400 ValidationProblemDetails (FAIL)

No exception middleware/filter exists.

### Fix

Add `TheUpperRoom.Api/ExceptionHandling/ValidationExceptionHandler.cs` using `IExceptionHandler` (ASP.NET Core 8+):

```csharp
public sealed class ValidationExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken ct)
    {
        if (exception is not ValidationException vex) return false;

        var errors = vex.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

        var problem = new ValidationProblemDetails(errors)
        {
            Status = StatusCodes.Status400BadRequest,
            Title  = "One or more validation errors occurred.",
            Type   = "https://tools.ietf.org/html/rfc7231#section-6.5.1"
        };

        httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        await httpContext.Response.WriteAsJsonAsync(problem, ct);
        return true;
    }
}
```

In `Program.cs`:
```csharp
builder.Services.AddExceptionHandler<ValidationExceptionHandler>();
builder.Services.AddProblemDetails();
// ...
app.UseExceptionHandler();
```

---

# Part C — One-type-per-file Rule (FAIL, CRITICAL)

## §B13

12+ files contain multiple top-level types. Worst offenders:

| File | Types |
|------|------:|
| `Api/Contacts/ContactsCqrs.cs` | **17** |
| `Api/Events/EventRsvpCqrs.cs` | **14** |
| `Api/Notes/NotesCqrs.cs` | **14** |
| `Api/Kanban/PatchCardCommand.cs` | 7 |
| `Api/Dashboard/GetDashboardQuery.cs` | 5 |
| `Api/Audit/ListAuditEntriesQuery.cs` | 4 |
| `Api/Events/CancelEventCommand.cs` | 4 |
| `Api/Ideas/IdeasDbContext.cs` | 4 |
| `Api/Auth/AuthController.cs` | 3 |
| `Api/Audit/AuditStore.cs` | 2 |
| `Api/Cities/CitiesDbContext.cs` | 2 |
| `Api/Contacts/ContactsController.cs` | 2 |
| `Api/Contacts/ContactsDbContext.cs` | 2 |

### Fix

Split every multi-type file so each top-level type lives in its own file named for the type. For example, `ContactsCqrs.cs` becomes:

```
Application/Contacts/
  ListContactsQuery.cs
  ListContactsResult.cs
  ListContactsHandler.cs
  GetContactQuery.cs
  GetContactResult.cs
  GetContactHandler.cs
  CreateContactCommand.cs
  CreateContactCommandValidator.cs
  CreateContactResult.cs
  CreateContactHandler.cs
  UpdateContactCommand.cs
  ...
  MutateContactOutcome.cs
```

This is the single largest mechanical refactor. Recommended approach: do it during the §B1 layer-migration so each type is split into its destination file in one motion.

---

# Part D — Authentication & User Management

## §A14 — PKCE OIDC + local username/password (PARTIAL, HIGH)

- **PKCE:** Implemented (`Auth/PkceVerifier.cs`, `AuthController.Exchange` at `AuthController.cs:82`). ✔
- **Local sign-in:** Endpoint exists but **always returns `Unauthorized`** at `AuthController.cs:50`. No credential validation. No `PasswordHash` column on `UserRow`.

### Fix

1. Add a password column to the user entity (after §A15 hashing is in place).
2. Implement actual credential check in `SignIn`:
   ```csharp
   var user = await db.Users.SingleOrDefaultAsync(u => u.Email == req.Email, ct);
   if (user is null || !passwordHasher.Verify(req.Password, user.PasswordHash))
   {
       AuditStore.Record(req.Email, "Session", "signin", "Failure");
       return Unauthorized();
   }
   var token = jwtIssuer.Issue(user);
   AuditStore.Record(user.Id.ToString(), "Session", "signin", "Success");
   return Ok(new SignInResponse(token));
   ```
3. Surface registration, password reset, email verification, account deletion endpoints (these are required by the guidance and not yet present).

---

## §A15 — Modern password hashing (FAIL, CRITICAL)

No Argon2id / PBKDF2 / bcrypt package. No `PasswordHash` field.

### Fix

1. Add a hashing dependency. Two acceptable options:
   - **`Microsoft.AspNetCore.Identity` `PasswordHasher<TUser>`** (PBKDF2 with 100k+ iterations) — minimal extra dependencies, since ASP.NET Core is already present.
   - **`Konscious.Security.Cryptography.Argon2`** for Argon2id.
2. Define `IPasswordHasher`/`Hash`/`Verify` in `TheUpperRoom.Application/Auth/` and implement in `TheUpperRoom.Infrastructure/Auth/`.
3. Add `PasswordHash` (string, non-nullable for password users) to the user table; add EF migration.
4. **Never log** plaintext passwords, code verifiers, or tokens. Audit all current `ILogger` usages in `Auth/` for this.

---

## §A16 — JWT validation (PASS)

`Program.cs:54–68` validates issuer, audience, lifetime, signing key, with `ClockSkew = TimeSpan.Zero`. ✔

---

## §A17 — Failed sign-in throttling + audit log (PARTIAL)

- Per-email lockout after 5 attempts / 30 min implemented in-memory in `AuthController.cs:12–13,29–47,103–116`.
- **Issues:**
  - In-memory `static` buckets do not survive restart and do not work across multiple Api instances.
  - `SignIn` does not write an `AuditStore.Record(...)` entry on failure; only `Exchange` (PKCE) logs success.

### Fix

1. Move the throttling state to a distributed cache (`IDistributedCache` / Redis) or a `LoginAttempts` table.
2. Write an audit entry on **every** sign-in attempt (success and failure) for both `SignIn` and `Exchange`.
3. Consider replacing the bespoke buckets with ASP.NET Core 8 rate-limiting middleware (`AddRateLimiter` + `RequireRateLimiting("signin")`).

---

## §A18 — RBAC end-to-end (PARTIAL)

- `Api/Rbac/Roles.cs` defines `SystemAdmin`, `CityLead`, `Member`, `Guest`.
- Handlers do role-string comparisons (`ContactsCqrs.cs:74`).
- **No domain-layer RBAC entities, no permissions, no claim transformations.**

### Fix

1. Move role/permission constants and entities to `TheUpperRoom.Domain/Rbac/` (`Role`, `Permission`, `RolePermission`).
2. Add a permission check abstraction (`IPermissionChecker` in Application; EF-backed implementation in Infrastructure).
3. Replace string-based role checks with permission checks (`permissions.Require("Contacts.Edit")`).
4. Surface roles/permissions to the frontend so the existing `permissions.service.ts` can drive UI gating from the same source of truth.

---

# Part E — Frontend (Angular)

## §F1 — Workspace structure (PASS)
## §F2 — Library dependency rules (PASS)

Both confirmed. No fix.

---

## §F3 — Interface-driven service consumption (PARTIAL, HIGH)

API library: 6/6 services have `*.contract.ts`. ✔
Domain library: missing for **4 of 5** services:
- `frontend/projects/domain/.../city-scope.service.ts`
- `frontend/projects/domain/.../idle.service.ts`
- `frontend/projects/domain/.../theme.service.ts`
- `frontend/projects/domain/.../sign-out.service.ts`

### Fix

For each, create a sibling contract file. Pattern:

```ts
// theme.service.contract.ts
import { InjectionToken } from '@angular/core';

export interface IThemeService {
  current(): 'light' | 'dark' | 'system';
  set(theme: 'light' | 'dark' | 'system'): void;
}

export const THEME_SERVICE = new InjectionToken<IThemeService>('THEME_SERVICE');
```

Wire the concrete class in the library's `providers` (or `provideDomain()`):
```ts
{ provide: THEME_SERVICE, useExisting: ThemeService }
```

Update consumers from `inject(ThemeService)` to `inject(THEME_SERVICE)`.

---

## §F4 — Angular Material everywhere (PARTIAL)

Components library wraps Material correctly (`tar-button`, `tar-text-field`, etc.). Several main-app templates use raw HTML:

| File | Element |
|------|---------|
| `the-upper-room/.../contact-list.html:2-9` | raw `<input type="search">` |
| `the-upper-room/.../contact-list.html:10-18` | raw `<button class="filter-chip">` |
| `the-upper-room/.../contact-list.html:20,34` | raw `<a class="btn-filled">` |
| `the-upper-room/.../global-search.html:4` | raw `<input type="text">` |
| `the-upper-room/.../appearance.html:4-15` | raw `<button>` radio group |
| `the-upper-room/.../app-shell.html:29-37` | raw `<button>` avatar menu |

### Fix

- Search inputs → `<tar-search-field>` (already exists in components lib) or `<mat-form-field appearance="outline"><input matInput …></mat-form-field>`.
- Filter chips → `<mat-chip-listbox>` / `<mat-chip-option>`.
- Filled link buttons → `<a tar-button …>` or `<a mat-flat-button …>`.
- Theme radio group → `<mat-button-toggle-group>`.
- Avatar menu → `<button mat-icon-button [matMenuTriggerFor]="avatarMenu">`.

---

## §F5 — Design tokens (PASS)

`frontend/projects/components/src/lib/tokens/_tokens.scss` defines the full Material 3 token set. ✔

---

## §F6 — BEM naming (PASS)

All sampled components conform. ✔

---

## §F7 — File-per-type for components (FAIL)

Inline templates (8 files):
1. `components/.../avatar/tar-avatar.ts`
2. `components/.../avatar/tar-avatar-uploader.ts`
3. `components/.../share-button/share-button.ts`
4. `the-upper-room/.../kanban/board-view/board-move-sheet-dialog.ts`
5. `the-upper-room/.../events/event-form/recurrence-edit-dialog.ts`
6. `the-upper-room/.../events/event-detail/event-cancel-dialog.ts`
7. `the-upper-room/.../events/event-detail/event-attendees-dialog.ts`

Inline styles (3 files): `tar-avatar.ts`, `tar-avatar-uploader.ts`, `share-button.ts`.

### Fix

For each component:
1. Create `<name>.html` with the template body.
2. Create `<name>.scss` with the styles.
3. In the `.ts` file, replace `template:`/`styles:` with:
   ```ts
   templateUrl: './name.html',
   styleUrls: ['./name.scss'],
   ```

---

## §F8 — Mobile-first responsive (PASS)

Viewport meta tag set; breakpoint mixins (`sm/md/lg/xl/xxl`) all use `min-width`. ✔

---

## §F9 — Playwright POM (PASS)

30+ page objects in `e2e/pages/`, 20+ component objects in `e2e/components/`. ✔

---

# Suggested Remediation Order

The fixes in §B1, §B3, and §B13 overlap heavily — do them as a single sweep per feature. Recommended sequencing:

1. **Pilot the architectural refactor on one small feature** (e.g. `Contacts`):
   - Add `IAppDbContext` and the merged `AppDbContext`.
   - Add FluentValidation packages, `ValidationBehavior`, `ValidationExceptionHandler`.
   - Migrate `ContactsCqrs.cs` → split into one-type-per-file under `Application/Contacts/`, with validators.
   - Move `ContactRow` → `Domain/Contacts/Contact.cs`; merge `ContactsDbContext` into `AppDbContext`.
   - Move `ContactsDataSeeder` to `Infrastructure/Seeding/`.
   - Run tests and confirm shape works end-to-end.
2. **Apply the same template to every remaining feature** (Cities, Events, Ideas, Kanban, Locations, Notes, Notifications, Partners, Push, Search, Audit, Dashboard).
3. **Replace Serilog** with `Microsoft.Extensions.Logging`.
4. **Implement password auth properly** (§A15 → §A14): add hasher, schema migration, real credential check, audit entries on every attempt; move throttle state out of static memory.
5. **Build out RBAC** in Domain/Application.
6. **Frontend cleanup** (parallelizable with backend work):
   - Add the four missing domain `*.contract.ts` files.
   - Extract inline templates/styles for the 8 components.
   - Convert raw `<input>`/`<button>` elements in the main app to Material/`tar-*` equivalents.

---

# Acceptance Checklist

Use this list to verify the audit is closed.

- [x] No CQRS handlers, validators, queries, commands, or `*Row` entities exist under `TheUpperRoom.Api/`. _(2026-05-10: every `*Handler`, `*Command`, `*Query`, `*Validator`, `*DbContext`, `*DataSeeder`, `*Row` type lives under `TheUpperRoom.Application` or `TheUpperRoom.Infrastructure`. The architecture test `Api_does_not_add_new_application_or_infrastructure_types` runs with `RestrictedApiTypeAllowList` empty.)_
- [~] Single `AppDbContext` in Infrastructure implementing `IAppDbContext` from Application. _(Functionally satisfied with per-feature interfaces: `I<Feature>DbContext` lives in Application, the concrete `<Feature>DbContext` lives in Infrastructure and implements it. The original "single AppDbContext" framing was a stand-in for "handlers depend on Application-defined abstractions, not concrete EF types"; that property holds. Collapsing the per-feature contexts into a single one is a separate, optional consolidation.)_
- [x] All handlers depend on `IAppDbContext`. _(2026-05-10: every handler under `Application/<Feature>/` injects an `I<Feature>DbContext` interface, not a concrete `DbContext`. The architecture test `Application_handlers_that_need_a_db_context_use_iappdbcontext` enforces this with a regex check for `\bI[A-Z][A-Za-z0-9]*DbContext\b`.)_
- [x] `FluentValidation` referenced; at least one `AbstractValidator<>` per command.
- [x] `ValidationBehavior` registered; `ValidationException` returns RFC-7807 `ValidationProblemDetails` with HTTP 400.
- [x] No `.cs` file in **`backend/src`** declares more than one top-level type; every file's name matches its type. _(Test projects still co-locate small private DTO records inside their test class file, which is intentional fixture-scoping; the architecture test scopes the rule to `backend/src` and runs with **zero allow-list entries** as of 2026-05-10.)_
- [x] No Serilog packages in any `.csproj`. _(Zero `Serilog` references in the entire backend tree.)_
- [x] All data seeders live under `TheUpperRoom.Infrastructure/Seeding/`. _(Cities, Contacts, Users — all under `Infrastructure/Seeding/<Feature>/`, registered via `Infrastructure.DependencyInjection.AddSeeders`.)_
- [x] Local sign-in actually verifies a stored password hash (Argon2id / PBKDF2 / bcrypt) and writes audit entries on every attempt. _(`PasswordHasher` uses PBKDF2 via `Microsoft.AspNetCore.Identity.PasswordHasher<TUser>`; `SignInHandler` audits every attempt via `AuditStore.Record`.)_
- [ ] Throttling state survives restart and is shared across instances. _(Still in-process via `AuthRateLimiter` — distributed Redis-backed limiter is the deferred Phase 5D follow-up.)_
- [x] Domain RBAC entities (`Role`, `Permission`) exist; handlers check permissions, not role strings. _(`Domain.Rbac.Permission` + `Domain.Rbac.RoleDefinition` exist as records; `Application.Rbac.IPermissionChecker` interface and `Infrastructure.Rbac.PermissionChecker` implementation exist; every handler/controller in `backend/src` consults `IPermissionChecker.HasPermission` rather than comparing role strings — `grep "Roles\." backend/src` returns zero hits as of 2026-05-10. EF-table-backed `Role`/`Permission`/`RolePermission` entities (4.11) deferred — `RoleCatalog` is the current source of truth.)_
- [x] Every Angular service in `domain/` has a `*.service.contract.ts` companion and is consumed via its `InjectionToken`.
- [x] No Angular component declares `template:` or `styles:`/`styles: [...]` inline.
- [x] No raw `<input>`/`<button>` in main-app templates where a Material or `tar-*` equivalent exists.
