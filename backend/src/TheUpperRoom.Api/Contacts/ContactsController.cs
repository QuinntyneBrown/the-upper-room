// traces_to: L2-079
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Audit;
using TheUpperRoom.Api.Rbac;
using TheUpperRoom.Application.Cities;
using TheUpperRoom.Domain.Cities;

namespace TheUpperRoom.Api.Contacts;

[ApiController]
[Route("api/v1/contacts")]
public sealed class ContactsController : ControllerBase
{
    private sealed class ContactMutable : IHasCity
    {
        public string Id { get; init; } = "";
        public string Name { get; set; } = "";
        public string CityId { get; init; } = "";
        public Contact ToContact() => new(Id, Name, CityId);
    }

    private static readonly Dictionary<string, ContactMutable> _store = new()
    {
        ["c1"] = new() { Id = "c1", Name = "Alice", CityId = "Toronto" },
        ["c2"] = new() { Id = "c2", Name = "Bob", CityId = "Halifax" },
    };

    [HttpGet]
    public IActionResult List([FromQuery] string? search, [FromQuery] int? page, [FromQuery] int? size)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        IEnumerable<ContactMutable> items = user.Role == Roles.SystemAdmin
            ? _store.Values
            : _store.Values.Where(c => c.CityId == user.City);

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
    public ActionResult<Contact> GetById(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        if (!_store.TryGetValue(id, out var c)) return NotFound();

        var allCities = user.Role == Roles.SystemAdmin && Request.Headers["X-All-Cities"].ToString() == "true";
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
        var contact = new Contact(id, DisplayName(body), user.City);
        var mut = new ContactMutable { Id = contact.Id, Name = contact.Name, CityId = contact.CityId };
        _store[id] = mut;
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

        if (!_store.TryGetValue(id, out var c)) return NotFound();
        var visible = CityScope.VisibleOrNull(c, user.City);
        if (visible is null) return NotFound();

        var before = JsonSerializer.Serialize(c.ToContact());
        c.Name = DisplayName(body);
        var after = JsonSerializer.Serialize(c.ToContact());
        AuditStore.Record(user.Id, "Contact", id, "Update", before, after);
        return Ok(c.ToContact());
    }

    [HttpPatch("{id}")]
    public ActionResult<Contact> Patch(string id, [FromBody] PatchContactRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        if (!_store.TryGetValue(id, out var c)) return NotFound();
        var visible = CityScope.VisibleOrNull(c, user.City);
        if (visible is null) return NotFound();

        if (body?.Name is not null)
        {
            var before = JsonSerializer.Serialize(c.ToContact());
            c.Name = body.Name;
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

        if (!_store.TryGetValue(id, out var c)) return NotFound();
        var visible = CityScope.VisibleOrNull(c, user.City);
        if (visible is null) return NotFound();

        AuditStore.Record(user.Id, "Contact", id, "Delete", beforeJson: JsonSerializer.Serialize(c.ToContact()));
        _store.Remove(id);
        return NoContent();
    }

    private SeedUser? GetCurrentUser()
    {
        var userId = Request.Headers["X-Test-User-Id"].ToString();
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
