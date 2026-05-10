# BUG-005 — Contact archive flow not implemented (RESOLVED 2026-05-10)

**Severity**: High
**Component**: backend + frontend
**Found in test**: TC-5.4 (Archive contact), TC-5.12 (Archived filter chip)
**User-guide refs**: §5.1 (Archived chip), §5.4 (Archive)
**Found**: 2026-05-09
**Status**: FIXED 2026-05-10
- Backend: `ContactRow.IsArchived`, `POST /api/v1/contacts/{id}/archive` + `/unarchive`, `?includeArchived=true` query, audit row recorded. xUnit-covered.
- Frontend: contact-list **Archived** chip flips the `includeArchived=true` query (param name now matches the backend). Contact-detail Archive button POSTs `/archive` and exposes an Undo snackbar that POSTs `/unarchive`. Restore button on archived contacts POSTs `/unarchive` directly.

## Description

User guide §5.4 documents an Archive action on contacts and §5.1 documents an Archived filter chip. The backend has no Archive endpoint, the `Contact` record has no archive flag, and there is no field on `ContactRow` to filter on. The behavior described cannot occur.

## Reproduction

```bash
# After authenticating, no archive endpoint exists:
curl -i -X POST http://localhost:5255/api/v1/contacts/<id>/archive
# → 405/404 depending on routing — no handler registered

# The Contact record:
grep "record Contact" backend/src/TheUpperRoom.Api/Contacts/Contact.cs
#   public sealed record Contact(string Id, string Name, string CityId) : IHasCity;
# No archived/IsArchived field.
```

## Expected

- A way to flip the archive bit on a contact (e.g. `POST /api/v1/contacts/{id}/archive` and a matching unarchive).
- A persisted `IsArchived` flag (or `ArchivedAt` timestamp) on the contact entity.
- `GET /api/v1/contacts` honours an `includeArchived=true` query and excludes archived rows by default.
- An audit row recording the archive event.

## Actual

`backend/src/TheUpperRoom.Api/Contacts/ContactsController.cs` registers only:

- `[HttpGet]` (line 32)
- `[HttpGet("{id}")]` (line 62)
- `[HttpPost]` (line 80)
- `[HttpPut("{id}")]` (line 99)
- `[HttpPatch("{id}")]` (line 120)
- `[HttpDelete("{id}")]` (line 142)

No archive route. The `PatchContactRequest` only carries `string? Name`. The `Contact` record (`Contact.cs`) has only `Id`, `Name`, `CityId`. The frontend list component therefore has nothing to bind an "Archived" chip to.

## Suggested fix

1. Add `bool IsArchived` (or `DateTimeOffset? ArchivedAt`) to `ContactRow` + an EF migration.
2. Add `[HttpPost("{id}/archive")]` and `[HttpPost("{id}/unarchive")]` actions that flip the flag and write an `Audit` row with action `Archive`/`Unarchive`.
3. Update the list query to filter out archived rows unless `?includeArchived=true`.
4. Wire the **Archive** button on the contact detail page and the **Archived** chip on the contact list to the new endpoints.
