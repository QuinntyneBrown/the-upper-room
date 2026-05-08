namespace TheUpperRoom.Domain.Notifications;

public sealed record NotificationType(string Code, string Title, string BodyTemplate, NotificationSeverity Severity);
