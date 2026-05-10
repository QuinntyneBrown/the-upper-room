namespace TheUpperRoom.Api.Notifications;

public sealed record ListNotificationsResult(NotificationDto[] Items, NotificationsOutcome Outcome);
