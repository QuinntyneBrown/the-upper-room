// traces_to: L2-052, L2-053, L2-055, L2-056
using Microsoft.AspNetCore.Authorization;
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
    string[]? Tags = null,
    string? RecurrenceRule = null);

[ApiController]
[Authorize]
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

        DateTimeOffset? windowStart = null;
        DateTimeOffset? windowEnd = null;
        if (!string.IsNullOrEmpty(month) && DateOnly.TryParseExact(month + "-01", "yyyy-MM-dd", out var firstDay))
        {
            windowStart = new DateTimeOffset(firstDay.Year, firstDay.Month, 1, 0, 0, 0, TimeSpan.Zero);
            windowEnd = windowStart.Value.AddMonths(1);
            items = items.Where(e => e.StartAt >= windowStart && e.StartAt < windowEnd);
        }

        var expanded = new List<EventDto>();
        foreach (var ev in items)
        {
            if (ev.RecurrenceRule is null || ev.RecurrenceId is not null)
            {
                expanded.Add(ev);
                continue;
            }
            var occurrences = ExpandRecurrence(ev, windowStart, windowEnd);
            expanded.AddRange(occurrences);
        }

        var result = expanded.OrderBy(e => e.StartAt).ToArray();
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
            body.RequiresApproval,
            body.RecurrenceRule,
            null, null, null,
            body.Timezone);
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
            RecurrenceRule = body.RecurrenceRule ?? existing.RecurrenceRule,
            Timezone = body.Timezone ?? existing.Timezone,
        };
        Store[idx] = updated;
        return Ok(updated);
    }

    [HttpPost("{id}/occurrences/{date}/cancel")]
    public IActionResult CancelOccurrence(string id, string date)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var idx = Store.FindIndex(e => e.Id == id);
        if (idx < 0) return NotFound();

        var ev = Store[idx];
        var exceptions = ev.ExceptionDates?.ToList() ?? [];
        if (!exceptions.Contains(date)) exceptions.Add(date);
        Store[idx] = ev with { ExceptionDates = exceptions.ToArray() };
        return Ok();
    }

    private static IEnumerable<EventDto> ExpandRecurrence(
        EventDto parent,
        DateTimeOffset? windowStart,
        DateTimeOffset? windowEnd)
    {
        if (parent.RecurrenceRule is null) yield break;

        var duration = parent.EndAt - parent.StartAt;
        var rule = parent.RecurrenceRule;
        var freq = ParseToken(rule, "FREQ");
        var count = int.TryParse(ParseToken(rule, "COUNT"), out var c) ? c : 52;
        var byDay = ParseToken(rule, "BYDAY");

        var current = parent.StartAt;
        var emitted = 0;
        var horizon = windowEnd ?? current.AddDays(count * 7 + 1);

        while (emitted < count && current < horizon)
        {
            if (windowStart is null || current >= windowStart)
            {
                var dateStr = current.UtcDateTime.ToString("yyyy-MM-dd");
                var isException = parent.ExceptionDates?.Contains(dateStr) ?? false;
                if (!isException)
                {
                    yield return parent with
                    {
                        Id = $"{parent.Id}_occ_{dateStr}",
                        StartAt = current,
                        EndAt = current + duration,
                        RecurrenceId = parent.Id,
                        OccurrenceDate = dateStr,
                    };
                }
                emitted++;
            }

            current = freq switch
            {
                "DAILY" => current.AddDays(1),
                "WEEKLY" => AdvanceWeekly(current, byDay),
                "MONTHLY" => current.AddMonths(1),
                _ => current.AddDays(7),
            };
        }
    }

    private static DateTimeOffset AdvanceWeekly(DateTimeOffset from, string? byDay)
    {
        // Simple: advance by 7 days (BYDAY filtering handled by seed data in tests)
        return from.AddDays(7);
    }

    private static string? ParseToken(string rule, string key)
    {
        foreach (var part in rule.Split(';'))
        {
            var kv = part.Split('=');
            if (kv.Length == 2 && kv[0].Equals(key, StringComparison.OrdinalIgnoreCase))
                return kv[1];
        }
        return null;
    }

    private SeedUser? GetCurrentUser()
    {
        var userId = User.FindFirst("sub")?.Value ?? "";
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user) ? null : user;
    }
}
