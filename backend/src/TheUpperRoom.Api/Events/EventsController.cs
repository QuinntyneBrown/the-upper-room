// traces_to: L2-052, L2-053, L2-055, L2-056
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Rbac;

namespace TheUpperRoom.Api.Events;

public sealed record CreateEventRequest(
    string Title,
    string? Description = null,
    DateTimeOffset? StartAt = null,
    DateTimeOffset? EndAt = null,
    string? Timezone = null,
    string? Location = null,
    string? LocationId = null,
    bool IsVirtual = false,
    string? VirtualUrl = null,
    int? Capacity = null,
    bool RequiresApproval = false,
    string[]? Tags = null);

[ApiController]
[Route("api/v1/events")]
public sealed class EventsController : ControllerBase
{
    internal static readonly List<EventDto> Store =
    [
        new("e-seed", "City Prayer Night", null, "Scheduled",
            DateTimeOffset.UtcNow.AddDays(14), DateTimeOffset.UtcNow.AddDays(14).AddHours(2),
            "City Hall, Toronto", false, 8, 100, [],
            "A night of prayer and worship for our city.",
            [
                new("a1", "Alice Nguyen", null, "Accepted"),
                new("a2", "Bob Chen", null, "Accepted"),
                new("a3", "Carol Davis", null, "Accepted"),
            ])
    ];

    [HttpGet]
    public IActionResult List(
        [FromQuery] string? status,
        [FromQuery] string? tag,
        [FromQuery] string? partner,
        [FromQuery] string? month,
        [FromQuery] bool myEvents = false)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        IEnumerable<EventDto> items = Store;

        if (!string.IsNullOrEmpty(status))
            items = items.Where(e => e.Status.Equals(status, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrEmpty(tag))
            items = items.Where(e => e.Tags.Contains(tag, StringComparer.OrdinalIgnoreCase));

        if (!string.IsNullOrEmpty(month) && DateOnly.TryParseExact(month + "-01", "yyyy-MM-dd", out var firstDay))
        {
            var start = new DateTimeOffset(firstDay.Year, firstDay.Month, 1, 0, 0, 0, TimeSpan.Zero);
            var end = start.AddMonths(1);
            items = items.Where(e => e.StartAt >= start && e.StartAt < end);
        }

        var result = items.OrderBy(e => e.StartAt).ToArray();
        return Ok(new { items = result, total = result.Length });
    }

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var ev = Store.FirstOrDefault(e => e.Id == id);
        if (ev is null) return NotFound();
        return Ok(ev);
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateEventRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null || string.IsNullOrWhiteSpace(body.Title))
            return UnprocessableEntity(new { error = "Title is required." });

        var ev = new EventDto(
            Guid.NewGuid().ToString(),
            body.Title,
            null,
            "Draft",
            body.StartAt ?? DateTimeOffset.UtcNow.AddDays(7),
            body.EndAt ?? DateTimeOffset.UtcNow.AddDays(7).AddHours(2),
            body.Location,
            body.IsVirtual,
            0,
            body.Capacity,
            body.Tags ?? [],
            body.Description,
            null,
            body.RequiresApproval);
        Store.Add(ev);
        return Created($"/api/v1/events/{ev.Id}", ev);
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] CreateEventRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null || string.IsNullOrWhiteSpace(body.Title))
            return UnprocessableEntity(new { error = "Title is required." });

        var idx = Store.FindIndex(e => e.Id == id);
        if (idx < 0) return NotFound();

        var existing = Store[idx];
        var updated = existing with
        {
            Title = body.Title,
            Description = body.Description,
            StartAt = body.StartAt ?? existing.StartAt,
            EndAt = body.EndAt ?? existing.EndAt,
            Location = body.Location,
            IsVirtual = body.IsVirtual,
            Capacity = body.Capacity,
            RequiresApproval = body.RequiresApproval,
            Tags = body.Tags ?? [],
        };
        Store[idx] = updated;
        return Ok(updated);
    }

    private SeedUser? GetCurrentUser()
    {
        var userId = Request.Headers["X-Test-User-Id"].ToString();
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user) ? null : user;
    }
}
