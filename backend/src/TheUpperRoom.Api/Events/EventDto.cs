// traces_to: L2-052, L2-053
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
    string[] Tags);
