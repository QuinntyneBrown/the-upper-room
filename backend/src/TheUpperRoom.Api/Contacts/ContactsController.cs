// traces_to: L2-079
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Audit;
using TheUpperRoom.Api.Rbac;
using TheUpperRoom.Application.Cities;
using TheUpperRoom.Domain.Cities;

namespace TheUpperRoom.Api.Contacts;

[ApiController]
[Authorize]
[Route("api/v1/contacts")]
public sealed class ContactsController(ContactsDbContext db) : ControllerBase
{
    internal static int StoreCount(SeedUser user, ContactsDbContext db) =>
        user.Role == Roles.SystemAdmin
            ? db.Contacts.Count()
            : db.Contacts.Count(c => c.CityId == user.City);

    internal static IEnumerable<Contact> Search(string term, SeedUser user, ContactsDbContext db)
    {
        var query = user.Role == Roles.SystemAdmin
            ? db.Contacts.AsEnumerable()
            : db.Contacts.Where(c => c.CityId == user.City).AsEnumerable();
        return query.Where(c => c.Name.Contains(term, StringComparison.OrdinalIgnoreCase))
                    .Select(c => c.ToContact());
    }

    [HttpGet]
    public IActionResult List(
        [FromQuery] string? search,
        [FromQuery] int? page,
        [FromQuery] int? size,
        [FromQuery] string? scope)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var allCities = scope == "all";
        if (allCities && user.Role != Roles.SystemAdmin) return StatusCode(403, new { error = "Forbidden" });

        IEnumerable<ContactRow> items = allCities || user.Role == Roles.SystemAdmin
            ? db.Contacts.AsEnumerable()
            : db.Contacts.Where(c => c.CityId == user.City).AsEnumerable();

        if (!string.IsNullOrEmpty(search))
            items = items.Where(c => c.Name.Contains(search, StringComparison.OrdinalIgnoreCase));

        var allItems = items.Select(c => c.ToContact()).ToArray();
        var total = allItems.Length;

        if (page.GetValueOrDefault() > 1 && size.GetValueOrDefault() > 0)
            allItems = allItems.Skip((page!.Value - 1) * size!.Value).Take(size.Value).ToArray();
        else if (size.GetValueOrDefault() > 0)
            allItems = allItems.Take(size!.Value).ToArray();

        return Ok(new { items = allItems, total });
    }

    [HttpGet("{id}")]
    public ActionResult<Contact> GetById(string id, [FromQuery] string? scope)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var allCities = scope == "all";
        if (allCities && user.Role != Roles.SystemAdmin) return StatusCode(403, new { error = "Forbidden" });

        var c = db.Contacts.Find(id);
        if (c is null) return NotFound();

        if (allCities) return Ok(c.ToContact());

        var visible = CityScope.VisibleOrNull(c, user.City);
        return visible is null ? NotFound() : Ok(c.ToContact());
    }

    [HttpPost]
    public ActionResult<Contact> Create([FromBody] CreateContactRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null) return BadRequest();
        if (string.IsNullOrWhiteSpace(body.FirstName))
            return UnprocessableEntity(new { error = "First name is required." });

        var id = Guid.NewGuid().ToString("N")[..8];
        var row = new ContactRow { Id = id, Name = DisplayName(body), CityId = user.City };
        db.Contacts.Add(row);
        db.SaveChanges();

        var contact = row.ToContact();
        AuditStore.Record(user.Id, "Contact", id, "Create", afterJson: JsonSerializer.Serialize(contact));
        return Created($"/api/v1/contacts/{id}", contact);
    }

    [HttpPut("{id}")]
    public ActionResult<Contact> Update(string id, [FromBody] CreateContactRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null) return BadRequest();
        if (string.IsNullOrWhiteSpace(body.FirstName))
            return UnprocessableEntity(new { error = "First name is required." });

        var c = db.Contacts.Find(id);
        if (c is null) return NotFound();
        if (CityScope.VisibleOrNull(c, user.City) is null) return NotFound();

        var before = JsonSerializer.Serialize(c.ToContact());
        c.Name = DisplayName(body);
        db.SaveChanges();
        var after = JsonSerializer.Serialize(c.ToContact());
        AuditStore.Record(user.Id, "Contact", id, "Update", before, after);
        return Ok(c.ToContact());
    }

    [HttpPatch("{id}")]
    public ActionResult<Contact> Patch(string id, [FromBody] PatchContactRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var c = db.Contacts.Find(id);
        if (c is null) return NotFound();
        if (CityScope.VisibleOrNull(c, user.City) is null) return NotFound();

        if (body?.Name is not null)
        {
            var before = JsonSerializer.Serialize(c.ToContact());
            c.Name = body.Name;
            db.SaveChanges();
            var after = JsonSerializer.Serialize(c.ToContact());
            AuditStore.Record(user.Id, "Contact", id, "Update", before, after);
        }

        return Ok(c.ToContact());
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var c = db.Contacts.Find(id);
        if (c is null) return NotFound();
        if (CityScope.VisibleOrNull(c, user.City) is null) return NotFound();

        AuditStore.Record(user.Id, "Contact", id, "Delete", beforeJson: JsonSerializer.Serialize(c.ToContact()));
        db.Contacts.Remove(c);
        db.SaveChanges();
        return NoContent();
    }

    private SeedUser? GetCurrentUser()
    {
        var userId = User.FindFirst("sub")?.Value ?? "";
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user) ? null : user;
    }

    private static string DisplayName(CreateContactRequest body)
    {
        var name = string.Join(
            ' ',
            new[] { body.FirstName.Trim(), body.LastName?.Trim() }
                .Where(s => !string.IsNullOrEmpty(s)));
        return body.DisplayName ?? name;
    }
}

public sealed record PatchContactRequest(string? Name);
