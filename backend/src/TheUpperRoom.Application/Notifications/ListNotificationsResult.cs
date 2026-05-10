namespace TheUpperRoom.Application.Notifications;

public sealed record ListNotificationsResult(NotificationDto[] Items, NotificationsOutcome Outcome);
