// traces_to: L2-052, L2-053, L2-055, L2-056
namespace TheUpperRoom.Api.Events;

public sealed record EventDto(
    string Id,
    string Title,
    string? CoverImageUrl,
    string Status,
    DateTimeOffset StartAt,
    DateTimeOffset EndAt,
    string? Location,
    bool IsVirtual,
    int RsvpCount,
    int? Capacity,
    string[] Tags,
    string? Description = null,
    IReadOnlyList<AttendeeDto>? Attendees = null,
    bool RequiresApproval = false,
    string? RecurrenceRule = null,
    string? RecurrenceId = null,
    string? OccurrenceDate = null,
    string[]? ExceptionDates = null,
    string? Timezone = null);
