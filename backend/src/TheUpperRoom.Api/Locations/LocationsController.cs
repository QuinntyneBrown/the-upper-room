// traces_to: L2-057, L2-058
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Rbac;

namespace TheUpperRoom.Api.Locations;

[ApiController]
[Route("api/v1/locations")]
public sealed class LocationsController : ControllerBase
{
    private sealed class LocationRecord
    {
        public string Id { get; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = "";
        public string Street { get; set; } = "";
        public string City { get; set; } = "";
        public string State { get; set; } = "";
        public string Country { get; set; } = "";
        public string PostalCode { get; set; } = "";
        public int? Capacity { get; set; }
        public double? Lat { get; set; }
        public double? Lng { get; set; }
        public bool Archived { get; set; }
    }

    private static readonly List<LocationRecord> _store = [];
    private static readonly HashSet<string> _referencedByFutureEvents = [];

    [HttpGet]
    public IActionResult List()
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var items = _store.Select(ToDto).ToList();
        return Ok(new { items, total = items.Count });
    }

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var loc = _store.FirstOrDefault(l => l.Id == id);
        return loc is null ? NotFound() : Ok(ToDto(loc));
    }

    [HttpPost]
    public IActionResult Create([FromBody] UpsertLocationRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null) return BadRequest();
        if (string.IsNullOrWhiteSpace(body.Name))
            return UnprocessableEntity(new { error = "Name is required." });
        if (body.Capacity.HasValue && body.Capacity.Value <= 0)
            return UnprocessableEntity(new { error = "Capacity must be a positive integer." });

        var loc = new LocationRecord
        {
            Name = body.Name,
            Street = body.Street ?? "",
            City = body.City ?? "",
            State = body.State ?? "",
            Country = body.Country ?? "",
            PostalCode = body.PostalCode ?? "",
            Capacity = body.Capacity,
            Lat = body.Lat,
            Lng = body.Lng,
        };
        _store.Add(loc);
        return Created($"/api/v1/locations/{loc.Id}", ToDto(loc));
    }

    [HttpPatch("{id}")]
    public IActionResult Update(string id, [FromBody] PatchLocationRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var loc = _store.FirstOrDefault(l => l.Id == id);
        if (loc is null) return NotFound();
        if (body is null) return BadRequest();

        if (body.Archived.HasValue) loc.Archived = body.Archived.Value;
        if (body.Name is not null) loc.Name = body.Name;

        return Ok(ToDto(loc));
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var loc = _store.FirstOrDefault(l => l.Id == id);
        if (loc is null) return NotFound();

        if (_referencedByFutureEvents.Contains(id))
            return Conflict(new { error = "Location is used by upcoming events." });

        _store.Remove(loc);
        return NoContent();
    }

    private static LocationDto ToDto(LocationRecord l) =>
        new(l.Id, l.Name, l.Street, l.City, l.State, l.Country, l.PostalCode, l.Capacity, l.Lat, l.Lng, l.Archived);

    private SeedUser? GetCurrentUser()
    {
        var userId = Request.Headers["X-Test-User-Id"].ToString();
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user) ? null : user;
    }
}

public sealed record UpsertLocationRequest(
    string Name, string? Street, string? City, string? State,
    string? Country, string? PostalCode, int? Capacity, double? Lat, double? Lng);

public sealed record PatchLocationRequest(bool? Archived, string? Name);
