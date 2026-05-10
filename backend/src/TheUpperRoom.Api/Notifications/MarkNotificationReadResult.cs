namespace TheUpperRoom.Api.Notifications;

public sealed record MarkNotificationReadResult(NotificationDto? Notification, NotificationsOutcome Outcome);
