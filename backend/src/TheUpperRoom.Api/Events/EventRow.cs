namespace TheUpperRoom.Api.Events;

public sealed class EventRow
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Status { get; set; } = "Scheduled";
    public DateTimeOffset StartAt { get; set; }
    public DateTimeOffset EndAt { get; set; }
    public string? Location { get; set; }
    public string? LocationId { get; set; }
    public bool IsVirtual { get; set; }
    public int? Capacity { get; set; }
    public bool RequiresApproval { get; set; }
    public string? Description { get; set; }
    public string[] Tags { get; set; } = Array.Empty<string>();
    public string? RecurrenceRule { get; set; }
    public string[] ExceptionDates { get; set; } = Array.Empty<string>();
    public string? Timezone { get; set; }

    public EventDto ToDto(int rsvpCount = 0, IReadOnlyList<AttendeeDto>? attendees = null) => new(
        Id, Title, null, Status, StartAt, EndAt, Location, IsVirtual,
        rsvpCount, Capacity, Tags, Description, attendees,
        RequiresApproval, RecurrenceRule, null, null,
        ExceptionDates.Length == 0 ? null : ExceptionDates, Timezone);
}
