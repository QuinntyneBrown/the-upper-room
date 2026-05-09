// traces_to: L2-062, L2-063
namespace TheUpperRoom.Api.Notifications;

public sealed record NotificationDto(
    string Id,
    string Code,
    string Title,
    string Body,
    Dictionary<string, string> Data,
    bool Read,
    DateTimeOffset CreatedAt);
