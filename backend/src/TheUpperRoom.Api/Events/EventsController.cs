// traces_to: L2-052, L2-053, L2-055
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Rbac;

namespace TheUpperRoom.Api.Events;

[ApiController]
[Route("api/v1/events")]
public sealed class EventsController : ControllerBase
{
    private static readonly List<EventDto> _store =
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

        IEnumerable<EventDto> items = _store;

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

        var ev = _store.FirstOrDefault(e => e.Id == id);
        if (ev is null) return NotFound();
        return Ok(ev);
    }

    private SeedUser? GetCurrentUser()
    {
        var userId = Request.Headers["X-Test-User-Id"].ToString();
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user) ? null : user;
    }
}
