using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Notifications;

public sealed class Notification : Entity
{
    public Notification(
        string userId,
        string code,
        string title,
        string body,
        NotificationSeverity severity,
        DateTimeOffset createdAt,
        string? deepLink = null,
        string? id = null) : base(id)
    {
        UserId = Guard.Id(userId, nameof(UserId));
        Code = Guard.Required(code, nameof(Code), 100);
        Title = Guard.Required(title, nameof(Title), 200);
        Body = Guard.Required(body, nameof(Body), 1000);
        Severity = severity;
        CreatedAt = Guard.Utc(createdAt, nameof(CreatedAt));
        DeepLink = Guard.Optional(deepLink, nameof(DeepLink), 1000);
    }

    public string UserId { get; }

    public string Code { get; }

    public string Title { get; }

    public string Body { get; }

    public NotificationSeverity Severity { get; }

    public DateTimeOffset CreatedAt { get; }

    public string? DeepLink { get; }

    public DateTimeOffset? ReadAt { get; private set; }

    public bool IsRead => ReadAt is not null;

    public void MarkRead(DateTimeOffset readAt) => ReadAt = Guard.Utc(readAt, nameof(readAt));
}
