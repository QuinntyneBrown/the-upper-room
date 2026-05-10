using TheUpperRoom.Infrastructure.Events;

namespace TheUpperRoom.Api.Events;

internal static class EventsMapping
{
    public static EventDto ToDto(this EventRow row, int rsvpCount = 0, IReadOnlyList<AttendeeDto>? attendees = null) => new(
        row.Id, row.Title, null, row.Status, row.StartAt, row.EndAt, row.Location, row.IsVirtual,
        rsvpCount, row.Capacity, row.Tags, row.Description, attendees,
        row.RequiresApproval, row.RecurrenceRule, null, null,
        row.ExceptionDates.Length == 0 ? null : row.ExceptionDates, row.Timezone);
}
