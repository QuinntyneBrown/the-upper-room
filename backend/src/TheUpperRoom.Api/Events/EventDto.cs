// traces_to: L2-052, L2-053, L2-055
namespace TheUpperRoom.Api.Events;

public sealed record AttendeeDto(string Id, string Name, string? AvatarUrl, string RsvpStatus);

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
    bool RequiresApproval = false);
