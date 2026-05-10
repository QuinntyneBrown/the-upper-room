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
