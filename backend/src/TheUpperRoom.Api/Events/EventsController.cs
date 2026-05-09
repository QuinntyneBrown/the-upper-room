// traces_to: L2-052, L2-053, L2-055, L2-056
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheUpperRoom.Api.Auth;
using TheUpperRoom.Application.Users;

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
public sealed class EventsController(
    EventsDbContext db,
    ICurrentUser currentUser,
    IUserDirectory userDirectory) : ControllerBase
{
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

        var rsvpCounts = db.Rsvps
            .Where(r => r.Status == "Going")
            .GroupBy(r => r.EventId)
            .ToDictionary(g => g.Key, g => g.Count());

        IEnumerable<EventDto> items = db.Events.AsEnumerable().Select(e => e.ToDto(rsvpCounts.GetValueOrDefault(e.Id)));

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
            expanded.AddRange(ExpandRecurrence(ev, windowStart, windowEnd));
        }

        var result = expanded.OrderBy(e => e.StartAt).ToArray();
        return Ok(new { items = result, total = result.Length });
    }

    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var row = db.Events.Find(id);
        if (row is null) return NotFound();
        var rsvpCount = db.Rsvps.Count(r => r.EventId == id && r.Status == "Going");
        return Ok(row.ToDto(rsvpCount));
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateEventRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null || string.IsNullOrWhiteSpace(body.Title))
            return UnprocessableEntity(new { error = "Title is required." });

        var row = new EventRow
        {
            Id = Guid.NewGuid().ToString(),
            Title = body.Title,
            Status = "Draft",
            StartAt = body.StartAt ?? DateTimeOffset.UtcNow.AddDays(7),
            EndAt = body.EndAt ?? DateTimeOffset.UtcNow.AddDays(7).AddHours(2),
            Location = body.Location,
            LocationId = body.LocationId,
            IsVirtual = body.IsVirtual,
            Capacity = body.Capacity,
            RequiresApproval = body.RequiresApproval,
            Description = body.Description,
            Tags = body.Tags ?? Array.Empty<string>(),
            RecurrenceRule = body.RecurrenceRule,
            Timezone = body.Timezone,
        };
        db.Events.Add(row);
        db.SaveChanges();
        return Created($"/api/v1/events/{row.Id}", row.ToDto());
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] CreateEventRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null || string.IsNullOrWhiteSpace(body.Title))
            return UnprocessableEntity(new { error = "Title is required." });

        var row = db.Events.Find(id);
        if (row is null) return NotFound();

        row.Title = body.Title;
        row.Description = body.Description;
        row.StartAt = body.StartAt ?? row.StartAt;
        row.EndAt = body.EndAt ?? row.EndAt;
        row.Location = body.Location;
        row.IsVirtual = body.IsVirtual;
        row.Capacity = body.Capacity;
        row.RequiresApproval = body.RequiresApproval;
        row.Tags = body.Tags ?? Array.Empty<string>();
        row.RecurrenceRule = body.RecurrenceRule ?? row.RecurrenceRule;
        row.Timezone = body.Timezone ?? row.Timezone;
        db.SaveChanges();
        return Ok(row.ToDto());
    }

    [HttpPost("{id}/occurrences/{date}/cancel")]
    public IActionResult CancelOccurrence(string id, string date)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var row = db.Events.Find(id);
        if (row is null) return NotFound();

        var exceptions = row.ExceptionDates.ToList();
        if (!exceptions.Contains(date)) exceptions.Add(date);
        row.ExceptionDates = exceptions.ToArray();
        db.SaveChanges();
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
                "WEEKLY" => current.AddDays(7),
                "MONTHLY" => current.AddMonths(1),
                _ => current.AddDays(7),
            };
        }
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

    private AppUser? GetCurrentUser() =>
        userDirectory.GetById(currentUser.UserId ?? "");
}
