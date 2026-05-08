// traces_to: L2-079
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Rbac;
using TheUpperRoom.Application.Cities;

namespace TheUpperRoom.Api.Contacts;

[ApiController]
[Route("api/v1/contacts")]
public sealed class ContactsController : ControllerBase
{
    private static readonly Contact[] Seed =
    {
        new("c1", "Alice", "Toronto"),
        new("c2", "Bob", "Halifax")
    };

    [HttpGet]
    public IActionResult List([FromQuery] string? search, [FromQuery] int? page, [FromQuery] int? size)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        IEnumerable<Contact> items = user.Role == Roles.SystemAdmin
            ? Seed
            : Seed.Where(c => c.CityId == user.City);

        if (!string.IsNullOrEmpty(search))
            items = items.Where(c => c.Name.Contains(search, StringComparison.OrdinalIgnoreCase));

        var allItems = items.ToArray();
        var total = allItems.Length;

        if (page.GetValueOrDefault() > 1 && size.GetValueOrDefault() > 0)
        {
            allItems = allItems.Skip((page!.Value - 1) * size!.Value).Take(size.Value).ToArray();
        }
        else if (size.GetValueOrDefault() > 0)
        {
            allItems = allItems.Take(size!.Value).ToArray();
        }

        return Ok(new { items = allItems, total });
    }

    [HttpGet("{id}")]
    public ActionResult<Contact> GetById(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var contact = Seed.FirstOrDefault(c => c.Id == id);
        if (contact is null) return NotFound();

        var allCities = user.Role == Roles.SystemAdmin
            && Request.Headers["X-All-Cities"].ToString() == "true";
        if (allCities) return Ok(contact);

        var visible = CityScope.VisibleOrNull(contact, user.City);
        return visible is null ? NotFound() : Ok(visible);
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

        var contact = Seed.FirstOrDefault(c => c.Id == id);
        if (contact is null) return NotFound();

        var visible = CityScope.VisibleOrNull(contact, user.City);
        if (visible is null) return NotFound();

        return Ok(contact with { Name = DisplayName(body) });
    }

    [HttpPatch("{id}")]
    public ActionResult<Contact> Patch(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var contact = Seed.FirstOrDefault(c => c.Id == id);
        if (contact is null) return NotFound();

        var visible = CityScope.VisibleOrNull(contact, user.City);
        return visible is null ? NotFound() : Ok(contact);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var contact = Seed.FirstOrDefault(c => c.Id == id);
        if (contact is null) return NotFound();

        var visible = CityScope.VisibleOrNull(contact, user.City);
        return visible is null ? NotFound() : NoContent();
    }

    private SeedUser? GetCurrentUser()
    {
        var userId = Request.Headers["X-Test-User-Id"].ToString();
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user)
            ? null
            : user;
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
