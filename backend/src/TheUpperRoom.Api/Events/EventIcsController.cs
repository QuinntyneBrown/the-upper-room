// traces_to: L2-055
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Infrastructure.Events;

namespace TheUpperRoom.Api.Events;

[ApiController]
[Route("api/v1/events/{id}/ics")]
public sealed class EventIcsController(EventsDbContext db) : ControllerBase
{
    [HttpGet]
    public IActionResult Get(string id)
    {
        var row = db.Events.Find(id);
        if (row is null) return NotFound();
        var ev = row.ToDto();

        var start = FormatUtc(ev.StartAt);
        var end = FormatUtc(ev.EndAt);
        var uid = $"{ev.Id}@the-upper-room";
        var summary = Escape(ev.Title);
        var location = Escape(ev.Location ?? string.Empty);
        var description = Escape(ev.Description ?? string.Empty);

        var ics = string.Join("\r\n",
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//The Upper Room//EN",
            "BEGIN:VEVENT",
            $"UID:{uid}",
            $"SUMMARY:{summary}",
            $"DTSTART:{start}",
            $"DTEND:{end}",
            $"LOCATION:{location}",
            $"DESCRIPTION:{description}",
            "END:VEVENT",
            "END:VCALENDAR");

        var slug = ev.Title.ToLowerInvariant()
            .Replace(' ', '-')
            .Replace("'", "");
        return File(System.Text.Encoding.UTF8.GetBytes(ics), "text/calendar",
            $"{slug}.ics");
    }

    private static string FormatUtc(DateTimeOffset dt) =>
        dt.UtcDateTime.ToString("yyyyMMdd'T'HHmmss'Z'");

    private static string Escape(string s) =>
        s.Replace("\\", "\\\\").Replace(";", "\\;").Replace(",", "\\,").Replace("\n", "\\n");
}
