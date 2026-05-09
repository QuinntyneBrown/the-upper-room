// traces_to: L2-060, L2-077
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Contacts;
using TheUpperRoom.Api.Events;
using TheUpperRoom.Api.Ideas;
using TheUpperRoom.Api.Locations;
using TheUpperRoom.Api.Partners;
using TheUpperRoom.Api.Rbac;


namespace TheUpperRoom.Api.Search;

public sealed record SearchResult(string Id, string Type, string Title, string? Subtitle, string Url);

[ApiController]
[Authorize]
[Route("api/v1/search")]
public sealed class SearchController(ContactsDbContext contactsDb, EventsDbContext eventsDb, IdeasDbContext ideasDb, LocationsDbContext locationsDb) : ControllerBase
{
    private const int MaxPerGroup = 5;

    [HttpGet]
    public IActionResult Search([FromQuery] string? q)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (string.IsNullOrWhiteSpace(q)) return Ok(EmptyResult());

        var term = q.Trim();

        var contacts = ContactsController.Search(term, user, contactsDb)
            .Take(MaxPerGroup)
            .Select(c => new SearchResult(c.Id, "contact", c.Name, c.CityId, $"/contacts/{c.Id}"))
            .ToList();

        var partners = PartnersController.Search(term)
            .Take(MaxPerGroup)
            .Select(p => new SearchResult(p.Id, "partner", p.Name, p.CityId, $"/partners/{p.Id}"))
            .ToList();

        var events = eventsDb.Events
            .AsEnumerable()
            .Where(e => e.Title.Contains(term, StringComparison.OrdinalIgnoreCase))
            .Take(MaxPerGroup)
            .Select(e => new SearchResult(e.Id, "event", e.Title, e.StartAt.ToString("MMM d"), $"/events/{e.Id}"))
            .ToList();

        var ideas = IdeasController.Search(term, ideasDb)
            .Take(MaxPerGroup)
            .Select(i => new SearchResult(i.Id, "idea", i.Title, i.Status, $"/ideas/{i.Id}"))
            .ToList();

        var locations = LocationsController.Search(term, locationsDb)
            .Take(MaxPerGroup)
            .Select(l => new SearchResult(l.Id, "location", l.Name, l.City, $"/locations/{l.Id}"))
            .ToList();

        return Ok(new { contacts, partners, events, ideas, locations });
    }

    private static object EmptyResult() =>
        new { contacts = Array.Empty<object>(), partners = Array.Empty<object>(), events = Array.Empty<object>(), ideas = Array.Empty<object>(), locations = Array.Empty<object>() };

    private SeedUser? GetCurrentUser()
    {
        var userId = User.FindFirst("sub")?.Value ?? "";
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user) ? null : user;
    }
}
