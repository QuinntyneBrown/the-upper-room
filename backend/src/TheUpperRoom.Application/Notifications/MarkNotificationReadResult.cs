namespace TheUpperRoom.Application.Notifications;

public sealed record MarkNotificationReadResult(NotificationDto? Notification, NotificationsOutcome Outcome);
