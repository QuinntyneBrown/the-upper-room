// traces_to: L2-057, L2-058, L2-113
// Traces to: TASK-0227
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Auth;
using TheUpperRoom.Api.Events;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Infrastructure.Events;
using TheUpperRoom.Infrastructure.Locations;

namespace TheUpperRoom.Api.Locations;

[ApiController]
[Authorize]
[Route("api/v1/locations")]
public sealed class LocationsController(
    LocationsDbContext db,
    EventsDbContext eventsDb,
    ICurrentUser currentUser,
    IUserDirectory userDirectory) : ControllerBase
{
    private const long MaxPhotoBytes = 10L * 1024 * 1024;

    internal static IEnumerable<(string Id, string Name, string City)> Search(string term, LocationsDbContext db) =>
        db.Locations
          .Where(l => !l.Archived && l.Name.Contains(term))
          .AsEnumerable()
          .Where(l => l.Name.Contains(term, StringComparison.OrdinalIgnoreCase))
          .Select(l => (l.Id, l.Name, l.City));

    [HttpGet]
    public IActionResult List()
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var items = db.Locations.Select(l => l.ToDto()).ToList();
        return Ok(new { items, total = items.Count });
    }

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var loc = db.Locations.Find(id);
        return loc is null ? NotFound() : Ok(loc.ToDto());
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

        var row = new LocationRow
        {
            Id = Guid.NewGuid().ToString(),
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
        db.Locations.Add(row);
        db.SaveChanges();
        return Created($"/api/v1/locations/{row.Id}", row.ToDto());
    }

    [HttpPost("{id}/photos")]
    public async Task<IActionResult> UploadPhoto(string id, [FromForm] IFormFile? file)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var loc = db.Locations.Find(id);
        if (loc is null) return NotFound();
        if (file is null) return BadRequest(new { error = "No file provided." });
        if (file.Length > MaxPhotoBytes)
            return UnprocessableEntity(new { error = "Photo is too large (max 10MB)." });
        if (!file.ContentType.StartsWith("image/"))
            return UnprocessableEntity(new { error = "Only image files are accepted." });
        if (loc.Photos.Length >= 10)
            return UnprocessableEntity(new { error = "Maximum 10 photos allowed." });

        var url = $"https://uploads.example.com/{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        loc.Photos = [.. loc.Photos, url];
        await db.SaveChangesAsync();
        return Created(url, loc.ToDto());
    }

    [HttpPatch("{id}")]
    public IActionResult Update(string id, [FromBody] PatchLocationRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var loc = db.Locations.Find(id);
        if (loc is null) return NotFound();
        if (body is null) return BadRequest();

        if (body.Archived.HasValue) loc.Archived = body.Archived.Value;
        if (body.Name is not null) loc.Name = body.Name;

        db.SaveChanges();
        return Ok(loc.ToDto());
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var loc = db.Locations.Find(id);
        if (loc is null) return NotFound();

        var now = DateTimeOffset.UtcNow;
        var hasFutureEvents = eventsDb.Events.Where(e => e.LocationId == id).AsEnumerable().Any(e => e.StartAt > now);
        if (hasFutureEvents)
            return Conflict(new { error = "Location is used by upcoming events." });

        db.Locations.Remove(loc);
        db.SaveChanges();
        return NoContent();
    }

    private AppUser? GetCurrentUser() =>
        userDirectory.GetById(currentUser.UserId ?? "");
}
